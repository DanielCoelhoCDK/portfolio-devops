output "region" {
  description = "Região implantada"
  value       = var.aws_region
}

output "vpc_id" {
  description = "ID da VPC criada em Dev"
  value       = module.vpc.vpc_id
}