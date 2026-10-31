terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Por enquanto usaremos o state local. 
  # Na próxima etapa migraremos para o Remote State com S3 + DynamoDB.
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PortfolioDevOps"
      Environment = "dev"
      ManagedBy   = "Terraform"
    }
  }

}

module "vpc" {
  source      = "../../modules/vpc"
  vpc_cidr    = var.vpc_cidr
  environment = var.environment
}