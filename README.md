[![Docker](https://img.shields.io/badge/Docker-24+-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Orchestration-Docker_Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Alpine-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Nginx](https://img.shields.io/badge/Reverse_Proxy-Nginx_Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)

# Portfolio DevOps

[![Backend CI](https://github.com/DanielCoelhoCDK/portfolio-devops/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/DanielCoelhoCDK/portfolio-devops/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/DanielCoelhoCDK/portfolio-devops/actions/workflows/frontend-ci.yml/badge.svg?branch=main)](https://github.com/DanielCoelhoCDK/portfolio-devops/actions/workflows/frontend-ci.yml)

Aplicação de portfólio pessoal desenvolvida como laboratório prático de DevOps. O projeto é composto por uma SPA em React, uma API REST em Spring Boot e um banco de dados PostgreSQL, todos executados em containers Docker.

## Visão geral da arquitetura

### Frontend

- React 19 com TypeScript e Vite.
- Build realizado em múltiplos estágios no `Dockerfile`.
- Nginx Alpine serve os arquivos estáticos da SPA na porta interna `80`.
- O Nginx encaminha requisições em `/api/` para o serviço backend dentro da rede Docker.

### Backend

- Spring Boot 3 com Java 17.
- API REST para gerenciamento de projetos.
- Spring Data JPA/Hibernate para persistência.
- Actuator habilitado para os endpoints de saúde e informações.

### Banco de dados

- PostgreSQL 16 Alpine.
- O script `database/init/01-init.sql` é executado na inicialização do volume.
- Os dados são persistidos no volume Docker `pgdata`.

Os três serviços compartilham a rede Docker `devops-network`. O backend acessa o banco pelo hostname `database`, e o frontend acessa o backend pelo hostname `backend`.

## Diagrama de arquitetura

```text
								 Navegador
									  |
									  | http://localhost:3000
									  v
					  +---------------------------+
					  | Frontend                  |
					  | React + Vite build        |
					  | Nginx :80                 |
					  +-------------+-------------+
										 |
						 /api/*      | proxy interno
										 v
					  +---------------------------+
					  | Backend                   |
					  | Spring Boot 3 + Java 17  |
					  | API REST :8080            |
					  +-------------+-------------+
										 |
					  JDBC PostgreSQL :5432
										 v
					  +---------------------------+
					  | Database                  |
					  | PostgreSQL 16             |
					  | volume: pgdata            |
					  +---------------------------+

					  Rede Docker: devops-network
```

## Pré-requisitos

- Docker Engine 24 ou superior.
- Docker Compose v2 ou superior, disponível como `docker compose`.
- Git, caso o projeto ainda não esteja disponível localmente.

Verifique a instalação com:

```bash
docker --version
docker compose version
```

## Execução com Docker Compose

Os comandos abaixo devem ser executados na raiz do projeto.

1. Construa as imagens e inicie todos os serviços em segundo plano:

	```bash
	docker compose -f docker/docker-compose.yml up --build -d
	```

2. Confira o estado dos containers:

	```bash
	docker compose -f docker/docker-compose.yml ps
	```

3. Acesse a aplicação no navegador:

	```text
	http://localhost:3000
	```

4. Consulte os logs, se necessário:

	```bash
	docker compose -f docker/docker-compose.yml logs -f
	```

5. Para parar os serviços, preservando os dados do PostgreSQL:

	```bash
	docker compose -f docker/docker-compose.yml down
	```

6. Para remover também o volume do banco e recriar os dados do zero:

	```bash
	docker compose -f docker/docker-compose.yml down -v
	```

## Endpoints expostos

| Serviço | URL local | Porta do container | Descrição |
| --- | --- | ---: | --- |
| Frontend | `http://localhost:3000` | `80` | Interface React servida pelo Nginx |
| Backend | `http://localhost:8080` | `8080` | API Spring Boot |
| PostgreSQL | `localhost:5432` | `5432` | Banco de dados para conexões externas |

### Endpoints da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/projects` | Lista todos os projetos |
| `GET` | `/api/projects/{id}` | Consulta um projeto por ID |
| `POST` | `/api/projects` | Cria um projeto |
| `PUT` | `/api/projects/{id}` | Atualiza um projeto |
| `DELETE` | `/api/projects/{id}` | Remove um projeto |
| `GET` | `/actuator/health` | Verifica a saúde do backend |

Exemplo de consulta da API:

```bash
curl http://localhost:8080/api/projects
```

Pelo frontend, as requisições em `/api/` são encaminhadas pelo Nginx ao backend na rede Docker. O backend também pode ser acessado diretamente pela porta `8080` durante o desenvolvimento ou diagnóstico.

## Variáveis de ambiente

As variáveis abaixo são configuradas pelo `docker/docker-compose.yml`:

| Serviço | Variável | Valor padrão | Finalidade |
| --- | --- | --- | --- |
| Database | `POSTGRES_DB` | `portfolio_db` | Nome do banco |
| Database | `POSTGRES_USER` | `devops_user` | Usuário do banco |
| Database | `POSTGRES_PASSWORD` | `devops_password` | Senha do banco |
| Backend | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://database:5432/portfolio_db` | URL JDBC usada pelo backend |
| Backend | `SPRING_DATASOURCE_USERNAME` | `devops_user` | Usuário da conexão JDBC |
| Backend | `SPRING_DATASOURCE_PASSWORD` | `devops_password` | Senha da conexão JDBC |
| Backend | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Estratégia de atualização do schema |

O backend também aceita as variáveis `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` por meio do `application.properties`. No ambiente Docker, a URL completa `SPRING_DATASOURCE_URL` configurada no Compose aponta para `database`, que é o nome do serviço na rede interna.

## Portas utilizadas

- `3000:80`: porta `3000` do host para o Nginx do frontend.
- `8080:8080`: porta `8080` do host para a API Spring Boot.
- `5432:5432`: porta `5432` do host para o PostgreSQL.

As portas podem ser alteradas no bloco `ports` do `docker/docker-compose.yml`, desde que a porta interna de cada serviço e as variáveis de conexão permaneçam coerentes.


👤 Autor

Daniel Coelho

Infrastructure & Cloud DevOps Engineer

    LinkedIn: antoniodanielcoelho

    GitHub: @DanielCoelhoCDK