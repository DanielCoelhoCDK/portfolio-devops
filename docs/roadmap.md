# Relatório de Progresso e Roadmap

Este documento acompanha a evolução do Portfolio DevOps, desde a implementação
local até a infraestrutura em nuvem, automação, observabilidade e GitOps.

## Visão geral e objetivos

O objetivo é construir uma plataforma completa, combinando um CMS full-stack
com infraestrutura Cloud/DevOps. O projeto demonstra domínio prático em:

- Arquitetura desacoplada e conteinerizada.
- Automação contínua de CI/CD com runners isolados.
- Infraestrutura como Código (IaC).
- Hardening e provisionamento automatizado.
- Observabilidade e telemetria.
- Orquestração de microsserviços e GitOps.

### Stack tecnológica

- **Frontend:** React 19 com TypeScript, Vite e Tailwind CSS, utilizando o tema
  Industrial Digital.
- **Backend:** Spring Boot 3 com Java 17, Spring Data JPA, Actuator e API REST.
- **Banco de dados:** PostgreSQL 16 Alpine com persistência no volume Docker
  `pgdata`.
- **Web server e proxy:** Nginx Alpine para entrega estática da SPA e reverse
  proxy de chamadas `/api/`.
- **Pipeline de Integração Contínua (CI):** GitHub Actions com matriz de jobs
  isolados por gatilhos de contexto (`paths`).

## Roadmap geral

| Fase | Título | Foco técnico | Status |
| --- | --- | --- | --- |
| 1 | Backend e banco de dados local | Modelagem relacional, API REST, Spring Boot e Docker Compose inicial | ✅ Concluída |
| 2 | Frontend SPA | Interface React consumindo a API REST via Nginx reverse proxy | ✅ Concluída |
| 3 | Conteinerização completa | Dockerfiles multi-stage e orquestração local com healthcheck | ✅ Concluída |
| 4 | Pipeline CI/CD | GitHub Actions com testes automatizados, service containers, type check e build | ✅ Concluída |
| 5 | Infraestrutura como Código (IaC) | Provisionamento na AWS via Terraform (VPC, Subnets, Gateways, EKS/ECS, RDS) | 🎯 Próximo passo |
| 6 | Automação e configuração | Provisionamento complementar e hardening de instâncias com Ansible | ⏳ Pendente |
| 7 | Observabilidade | Métricas e dashboards com Prometheus, Grafana e Actuator | ⏳ Pendente |
| 8 | Kubernetes e GitOps | Deploy declarativo em cluster Kubernetes usando Argo CD e Helm | ⏳ Pendente |

## Estado atual: implementações validadas

### Infraestrutura e banco de dados local

- **Estrutura de diretórios:** organização modular versionada no GitHub,
  distribuída entre `backend`, `database`, `docker`, `docs` e `frontend`.
- **Script DDL declarativo:** o arquivo `database/init/01-init.sql` provisiona
  as tabelas `technologies`, `projects` e a tabela associativa
  `project_technologies`, com integridade referencial.
- **PostgreSQL 16:** containerizado com script executado via
  `/docker-entrypoint-initdb.d/`, persistência em volume `pgdata` e verificação
  contínua de integridade via `pg_isready`.

### Backend Spring Boot

- **Configuração e resiliência:** `application.properties` desacoplado,
  utilizando dialeto PostgreSQL, schema gerenciado e parametrização declarativa
  de variáveis de ambiente.
- **Arquitetura em camadas:** separação estrita de responsabilidades em
  Entities JPA, DTOs, Repositories e Controllers.
- **API REST documentada:** endpoints CRUD expondo códigos de status semânticos
  `200`, `201`, `204` e `404`.
- **Multi-stage build:** empacotamento com Maven Wrapper desacoplado da imagem
  final, com runtime leve em Eclipse Temurin JRE e mitigação de
  vulnerabilidades via execução não-root.

### Frontend SPA

- **React 19 e TypeScript:** Design System Industrial Digital, métricas
  dinâmicas, modal de cadastro e tipagem estrita com TypeScript.
- **Multi-stage build com Nginx:** compilação estática sobre Node Alpine e
  entrega de artefatos via servidor web Nginx Alpine de alta performance.
- **Proxy reverso e mitigação de CORS:** roteamento interno das rotas `/api/`
  para o container do Spring Boot, eliminando acoplamentos de porta no cliente.

### Orquestração e governança de código

- **Docker Compose orquestrado:** stack operando em rede bridge dedicada
  (`devops-network`), com ordem de inicialização regida por healthchecks
  (`service_healthy`).
- **Portabilidade de infraestrutura:** inicialização completa de ponta a ponta
  a partir de ambiente limpo via `docker compose up -d`.
- **Cultura Git:** histórico de commits estruturado de acordo com as diretrizes
  do Conventional Commits (`feat:`, `chore:`, `docs:`, `ci:`).

### Pipeline de CI/CD (GitHub Actions)

- **Pipelines desacoplados e orientados a escopo:** separação dos fluxos de
  trabalho em `.github/workflows/backend-ci.yml` e
  `.github/workflows/frontend-ci.yml`, disparados exclusivamente mediante
  alterações em seus respectivos caminhos (`paths`).
- **Service containers efêmeros (Backend CI):** provisionamento sob demanda de
  container oficial PostgreSQL 16 Alpine na máquina virtual Ubuntu do runner,
  com healthcheck (`pg_isready`) e sincronização de DDL (`create-drop`) para
  validação dos testes de contexto Spring (`PortfolioApplicationTests`).
- **Validação de tipagem e build estático (Frontend CI):** automação de
  instalação limpa de dependências com `npm ci`, checagem estrutural de código
  TypeScript e geração de artefatos de produção do Vite em tempo médio de
  execução inferior a 25 segundos.
- **Transparência de status:** badges dinâmicos de CI/CD no topo do `README.md`,
  refletindo a saúde das esteiras em tempo real.

## Próximos passos: Fase 5, Infraestrutura como Código (IaC) com Terraform

O próximo incremento de engenharia consiste em abstrair toda a infraestrutura
de nuvem em código declarativo, versionável e reproduzível utilizando o
Terraform.

### Estruturação de diretórios Terraform

Criar a estrutura de IaC em `terraform/`, com divisão em módulos reutilizáveis
(`network`, `compute` e `database`).

### Camada de rede (VPC)

Provisionar Virtual Private Cloud (VPC), subnets públicas e privadas em
multi-AZ, Internet Gateway, NAT Gateway e tabelas de roteamento na AWS.

### Gerenciamento de estado (Remote State)

Configurar backend remoto no Amazon S3 com state locking via tabela DynamoDB,
garantindo consistência e impedindo execuções simultâneas conflitantes.

### Camada de banco de dados gerenciado (Amazon RDS)

Codificar a transição do banco containerizado local para uma instância
gerenciada PostgreSQL no RDS em subnet privada.

### Segurança e conformidade (Security Groups)

Criar regras de firewall (Security Groups) com menor privilégio, permitindo
tráfego apenas nas portas necessárias entre as camadas de aplicação e banco de
dados.

## Direcionamento das fases subsequentes

Após o provisionamento declarativo com Terraform:

### Fase 6: automação

Orquestrar a configuração do ambiente, o deployment automatizado de agentes e o
hardening do sistema operacional com Ansible.

### Fase 7: observabilidade

Expor métricas operacionais com Spring Boot Actuator, agregando-as com
Prometheus e visualizando painéis técnicos no Grafana.

### Fase 8: Kubernetes e GitOps

Migrar a aplicação para um cluster Kubernetes (EKS), padronizando pacotes com
Helm e adotando reconciliação contínua com Argo CD.
