output "ecr_server_url" {
  description = "ECR URL for scm-server image pushes"
  value       = aws_ecr_repository.scm_server.repository_url
}

output "ecr_client_url" {
  description = "ECR URL for scm-client image pushes"
  value       = aws_ecr_repository.scm_client.repository_url
}

output "eks_cluster_name" {
  description = "EKS cluster name for kubectl config"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "rds_endpoint" {
  description = "RDS instance connection endpoint — use in K8s secrets"
  value       = aws_db_instance.scm_postgres.endpoint
  sensitive   = true
}

output "rds_db_name" {
  description = "RDS PostgreSQL database name"
  value       = aws_db_instance.scm_postgres.db_name
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "kubeconfig_command" {
  description = "Command to configure kubectl for the new cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
