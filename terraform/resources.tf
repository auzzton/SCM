# ==============================================================
# VPC — Custom VPC with public and private subnets
# EKS nodes run in private subnets; the ALB runs in public.
# ==============================================================
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "scm-vpc"
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true   # Private subnet pods reach internet for ECR pulls
  single_nat_gateway   = true   # Cost-optimized; use false for production HA
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Required tags for AWS Load Balancer Controller auto-discovery
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

# ==============================================================
# ECR Repositories — Docker image registries
# ==============================================================
resource "aws_ecr_repository" "scm_server" {
  name                 = "scm-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true   # Scans images for CVEs on every push
  }
}

resource "aws_ecr_repository" "scm_client" {
  name                 = "scm-client"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# ECR lifecycle policy — keep only the last 10 tagged images
resource "aws_ecr_lifecycle_policy" "scm_server_policy" {
  repository = aws_ecr_repository.scm_server.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "scm_client_policy" {
  repository = aws_ecr_repository.scm_client.name
  policy     = aws_ecr_lifecycle_policy.scm_server_policy.policy
}

# ==============================================================
# EKS Cluster
# ==============================================================
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.eks_cluster_name
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Enable public access to the K8s API server
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    default = {
      instance_types = [var.eks_node_instance_type]
      min_size       = var.eks_min_nodes
      max_size       = var.eks_max_nodes
      desired_size   = var.eks_desired_nodes
    }
  }

  # Enable IRSA — allows pods to assume IAM roles via service accounts
  enable_irsa = true
}

# ==============================================================
# RDS PostgreSQL
# ==============================================================

# Security group: only EKS private subnets can reach the DB
resource "aws_security_group" "rds_sg" {
  name        = "scm-rds-sg"
  description = "Allow PostgreSQL from EKS nodes"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "scm_db_subnet_group" {
  name       = "scm-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "SCM DB Subnet Group"
  }
}

resource "aws_db_instance" "scm_postgres" {
  identifier        = "scm-postgres"
  engine            = "postgres"
  engine_version    = "15.5"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_encrypted = true   # Encrypts data at rest with AWS KMS

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.scm_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  multi_az               = false  # Set to true for production HA
  publicly_accessible    = false  # DB is never reachable from internet
  deletion_protection    = true   # Prevents accidental destruction
  skip_final_snapshot    = false
  final_snapshot_identifier = "scm-postgres-final"

  backup_retention_period = 7     # 7-day automated backups
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:05:00-sun:06:00"
}
