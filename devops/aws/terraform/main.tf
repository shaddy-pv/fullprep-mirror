# =============================================
# AWS Infrastructure as Code (Terraform)
# FullPrep ECS Deployment Configuration
# =============================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "fullprep-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "fullprep-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "FullPrep"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps-Shadan"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "fullprep-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "fullprep-vpc"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/fullprep-backend"
  retention_in_days = 30

  tags = {
    Name        = "fullprep-logs"
    Environment = var.environment
  }
}
