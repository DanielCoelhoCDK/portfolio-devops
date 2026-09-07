# Relatório de Progresso e Roadmap 2.0

## Projeto Portfólio DevOps

## 1. Visão geral e objetivos

### Objetivo

Construir uma plataforma completa, combinando um CMS full-stack com infraestrutura Cloud/DevOps. O projeto demonstra domínio prático em:

- Arquitetura de microsserviços.
- Conteinerização.
- Automação de CI/CD.
- Infraestrutura como Código (IaC).
- Observabilidade.
- Orquestração de aplicações.

### Stack tecnológica

- **Frontend:** React 19 com TypeScript, Vite e Tailwind CSS, utilizando o tema `Industrial Digital`.
- **Backend:** Spring Boot 3 com Java 17, Spring Data JPA, Actuator e API REST.
- **Banco de dados:** PostgreSQL 16 Alpine com persistência no volume Docker `pgdata`.
- **Web server e proxy:** Nginx Alpine para entrega estática da SPA e reverse proxy das chamadas `/api/`.

## 2. Roadmap geral

| Fase | Título | Foco técnico | Status |
| --- | --- | --- | --- |
| 1 | Backend e banco de dados local | Modelagem relacional, API REST, Spring Boot e Docker Compose inicial | ✅ Concluída |
| 2 | Frontend SPA | Interface React consumindo a API REST via Axios/Fetch | ✅ Concluída |
| 3 | Conteinerização completa | Dockerfiles multi-stage e orquestração local de toda a stack | ✅ Concluída |
| 4 | Pipeline CI/CD | GitHub Actions com testes automatizados, build e lint | 🎯 Próximo passo |
| 5 | Infraestrutura como Código (IaC) | Provisionamento na AWS via Terraform, incluindo VPC, EKS/ECS e RDS | ⏳ Pendente |
| 6 | Automação e configuração | Provisionamento complementar e hardening com Ansible | ⏳ Pendente |
| 7 | Observabilidade | Métricas e dashboards com Prometheus, Grafana e Actuator | ⏳ Pendente |
| 8 | Kubernetes e GitOps | Deploy declarativo em cluster Kubernetes usando Argo CD e Helm | ⏳ Pendente |

## 3. Estado atual: implementações validadas

### 3.1 Infraestrutura e banco de dados local

- **Estrutura de diretórios:** organização versionada no GitHub, distribuída entre `backend`, `database`, `docker`, `docs` e `frontend`.
- **Script DDL declarativo:** o arquivo `database/init/01-init.sql` define as tabelas `technologies`, `projects` e a tabela associativa `project_technologies`, implementando o relacionamento N:N com chaves `BIGSERIAL` e `BIGINT`.
- **PostgreSQL 16:** serviço orquestrado com o script montado em `/docker-entrypoint-initdb.d/`, volume persistente `pgdata` e monitoramento por healthcheck baseado em `pg_isready`.

### 3.2 Backend Spring Boot

- **Configuração:** o arquivo `application.properties` define o dialeto PostgreSQL, a sincronização do schema por `ddl-auto=update` e fallback de variáveis de ambiente seguindo o padrão 12-Factor App.
- **Arquitetura em camadas:** modelos JPA, DTOs, repositories e controllers organizados por responsabilidade.
- **API REST:** CRUD completo de projetos com códigos HTTP semânticos `200`, `201`, `204` e `404`.
- **Conteinerização multi-stage:** compilação com Maven Wrapper e runtime enxuto baseado em Eclipse Temurin JRE, executado com usuário não-root.

### 3.3 Frontend SPA

- **Interface React 19 e TypeScript:** aplicação com Design System `Industrial Digital`, cards de métricas, modal para cadastro de novos projetos e filtros dinâmicos.
- **Conteinerização multi-stage:** compilação em Node Alpine e entrega dos artefatos estáticos sobre Nginx Alpine.
- **Reverse proxy integrado:** o Nginx encaminha internamente as requisições em `/api/` para o backend na rede Docker, reduzindo problemas de CORS.

### 3.4 Orquestração e governança de código

- **Docker Compose unificado:** os três serviços são definidos de forma declarativa na rede isolada `devops-network`, com dependência de saúde configurada por `condition: service_healthy`.
- **Portabilidade validada:** o projeto foi clonado e executado em ambiente limpo, sem dependências de runtime instaladas diretamente no host.
- **Cultura Git e documentação:** `README.md` estruturado com diagramas ASCII, badges de tecnologia e histórico padronizado segundo Conventional Commits.

## 4. Próximos passos: Fase 4, CI/CD com GitHub Actions

O próximo incremento será a criação do pipeline automatizado no GitHub Actions. A implementação deverá:

1. **Criar a estrutura de workflows:** adicionar o diretório `.github/workflows/` ao repositório e definir os arquivos de workflow necessários.
2. **Automatizar o CI do backend:** executar a compilação com o Maven Wrapper e os testes automatizados a cada `push` na branch `main`.
3. **Validar o frontend:** executar a verificação estática de tipos com TypeScript e o build da aplicação React/Vite.
4. **Executar o lint:** incluir a validação de qualidade estática do frontend no pipeline.
5. **Publicar o status do pipeline:** adicionar ao `README.md` um badge de build verde (`Passing`) vinculado ao workflow do repositório.

## 5. Direcionamento das fases futuras

Após a conclusão da Fase 4, a evolução prevista é:

- **Fase 5, IaC:** provisionar na AWS a rede VPC, os recursos de computação EKS/ECS e o banco RDS com Terraform.
- **Fase 6, automação:** complementar o provisionamento e aplicar hardening com Ansible.
- **Fase 7, observabilidade:** integrar métricas, dashboards e sinais de saúde com Prometheus, Grafana e Spring Boot Actuator.
- **Fase 8, Kubernetes e GitOps:** realizar deploy declarativo em Kubernetes usando Helm e Argo CD.
