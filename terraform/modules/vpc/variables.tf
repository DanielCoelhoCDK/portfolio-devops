variable "vpc_cidr" {
  description = "Bloco CIDR para a VPC"
  type        = string
}

variable "environment" {
  description = "Ambiente de execução"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "Lista de CIDRs para as subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Lista de CIDRs para as subnets privadas"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "Zonas de Disponibilidade para distribuição da VPC"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}