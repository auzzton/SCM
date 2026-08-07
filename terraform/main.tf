terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Store state in S3 + DynamoDB for team collaboration.
  # Create the bucket and table manually ONCE before first terraform init.
  backend "s3" {
    bucket         = "scm-terraform-state"       # Change to your unique bucket name
    key            = "scm/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "scm-terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SCM"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
