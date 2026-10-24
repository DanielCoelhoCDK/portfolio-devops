output "vpc_id" {
  description = "ID da VPC criada"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ids" {
  description = "IDs dos NAT Gateways, um por AZ"
  value       = aws_nat_gateway.nat[*].id
}

output "private_route_table_ids" {
  description = "IDs das tabelas de rotas privadas"
  value       = aws_route_table.private[*].id
}
