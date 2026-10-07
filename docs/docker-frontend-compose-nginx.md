# Docker do Frontend, Compose e Proxy Nginx

Este documento reúne a explicação do `frontend/Dockerfile` e o fluxo entre navegador, Nginx, API Spring Boot e Docker Compose, incluindo caminhos, portas, CORS, health check, testes e reconstrução das imagens.

## 1. Visão geral

O Compose sobe três serviços:

```text
Navegador
   |
   | http://localhost:3000
   v
frontend: Nginx na porta 80
   |
   | /api/* encaminhado para backend:8080
   v
backend: Spring Boot na porta 8080
   |
   | JDBC para database:5432
   v
database: PostgreSQL
```

Os serviços compartilham a rede Docker `devops-network`. O navegador acessa o frontend pela porta publicada `3000`; os containers conversam entre si usando os nomes dos serviços e as portas internas.

## 2. Como funciona o Dockerfile do frontend

O [Dockerfile](../frontend/Dockerfile) usa dois estágios. O primeiro compila a aplicação com Node.js; o segundo entrega apenas os arquivos compilados por meio do Nginx.

### Estágio 1: build com Node.js

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

- `FROM node:20-alpine AS builder`: cria um estágio temporário com Node.js 20, chamado `builder`.
- `WORKDIR /app`: define `/app` como diretório de trabalho dentro desse estágio.
- `COPY package*.json ./`: copia `package.json` e, quando presente, `package-lock.json` da pasta de build para `/app` no estágio.
- `RUN npm ci`: instala as dependências dentro do container, em geral sob `/app/node_modules`, respeitando o lockfile.
- `COPY . .`: copia o restante do contexto de build para `/app`.
- `RUN npm run build`: compila o frontend. Com Vite, o resultado normalmente fica em `/app/dist`.

No Compose, o contexto de build é `../frontend`, relativo ao arquivo `docker/docker-compose.yml`. Portanto, durante o build, a origem dos arquivos é a pasta `frontend/` do projeto. Por exemplo, `frontend/src/App.tsx` é copiado para `/app/src/App.tsx` no estágio `builder`.

Esses caminhos `/app` e `/app/dist` existem dentro do ambiente Docker, não são pastas criadas diretamente na máquina host.

### Estágio 2: Nginx

```dockerfile
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- `FROM nginx:alpine`: inicia outro estágio, que será a imagem final.
- `COPY --from=builder /app/dist /usr/share/nginx/html`: copia os artefatos compilados do primeiro estágio para a pasta que o Nginx serve.
- `COPY nginx.conf /etc/nginx/conf.d/default.conf`: copia `frontend/nginx.conf` da máquina para a configuração do Nginx dentro da imagem final.
- `EXPOSE 80`: documenta que o Nginx escuta na porta 80 do container. Isso, sozinho, não publica a porta no host.
- `CMD [...]`: executa o Nginx em primeiro plano, mantendo o processo principal do container ativo.

O estágio final não recebe o Node.js, o código-fonte nem o `node_modules`; ele contém o Nginx, a configuração e os arquivos estáticos produzidos no build.

## 3. Host, imagem e container: os caminhos

Assumindo que o projeto está em `/home/coelho/Projetos/portfolio-devops`, o mapeamento conceitual é:

```text
Máquina host
portfolio-devops/frontend/
  package.json
  package-lock.json
  src/
  nginx.conf
        |
        | contexto de build: ../frontend
        v
Estágio temporário builder
/app/
  package.json
  node_modules/
  src/
  dist/
        |
        | COPY --from=builder
        v
Imagem/container final do frontend
/usr/share/nginx/html/
  index.html
  assets/...
/etc/nginx/conf.d/default.conf
```

O caminho exato do host depende de onde o repositório está clonado. O importante é que os caminhos `/app` e `/usr/share/nginx/html` são internos à imagem/container.

## 4. Serviço Compose e nome do container

No [docker-compose.yml](../docker/docker-compose.yml), o bloco `backend:` define o nome do serviço Compose. A propriedade `container_name` dá um nome explícito ao container:

```yaml
services:
  backend:
    container_name: devops-backend
```

Assim:

- `backend` é o nome DNS do serviço dentro da rede Compose;
- `devops-backend` é o nome explícito do container;
- o Nginx usa `backend:8080`, não `devops-backend:8080`.

O Docker Compose resolve `backend` para o endereço IP do container correspondente dentro da rede `devops-network`. Isso permite que o IP do container mude sem alterar a configuração do Nginx.

## 5. Como o Nginx encaminha chamadas da API

A configuração em [nginx.conf](../frontend/nginx.conf) tem uma regra para arquivos do frontend e outra para `/api/`:

```nginx
location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://backend:8080/api/;
}
```

- Requisições de arquivos e páginas são servidas de `/usr/share/nginx/html` dentro do container do frontend.
- `try_files ... /index.html` faz fallback para a SPA quando o caminho não corresponde a um arquivo; isso permite que rotas do frontend continuem funcionando ao atualizar a página.
- Requisições iniciadas por `/api/` são encaminhadas para o serviço Compose `backend`, na porta interna `8080`.

O controller Spring Boot usa o prefixo `/api/projects`, conforme [ProjectController.java](../backend/src/main/java/com/daniel/portfolio/controller/ProjectController.java). A regra atual preserva esse caminho ao encaminhar `/api/projects` para `http://backend:8080/api/projects`.

O navegador não conhece nem precisa resolver o hostname Docker `backend`. Essa resolução é feita apenas entre containers.

## 6. URL usada pelo frontend e CORS

Em [api.ts](../frontend/src/services/api.ts), a configuração atual é:

```ts
const api = axios.create({
    baseURL: '/api',
});
```

Então:

```ts
api.get('/projects');
```

gera uma chamada do navegador para:

```text
http://localhost:3000/api/projects
```

O fluxo fica:

```text
Navegador
  -> localhost:3000/api/projects
  -> Nginx no container frontend
  -> backend:8080/api/projects
```

A página e a API são acessadas pelo navegador na mesma origem, `http://localhost:3000`. Por isso, o navegador não considera essa chamada cross-origin e não exige CORS para esse fluxo. A conexão do Nginx ao backend acontece no lado do servidor, entre containers; a política CORS do navegador não se aplica a essa conexão interna.

Antes de usar `baseURL: '/api'`, o Axios apontava diretamente para `http://localhost:8080/api`. Como a página vinha de `http://localhost:3000` e a API de `http://localhost:8080`, as origens eram diferentes por causa da porta. Nesse fluxo direto, o navegador exige cabeçalhos CORS do backend.

O controller atual tem `@CrossOrigin(origins = "*")`, que permite chamadas diretas de qualquer origem para seus endpoints. Com o fluxo pelo proxy, essa permissão não é necessária para a comunicação normal do navegador com `/api`. CORS não é autenticação nem controle de acesso: ele restringe o que navegadores permitem que páginas de outras origens leiam.

## 7. Health check pelo proxy

O health check em `api.ts` ainda usa uma URL absoluta:

```ts
axios.get('http://localhost:8080/actuator/health');
```

Por isso, atualmente ele ignora o Nginx e acessa diretamente a porta `8080` publicada pelo Compose. A configuração atual do Nginx só encaminha `/api/`; ela não encaminha `/actuator/`.

Para passar o health check pelo proxy, adicione uma regra ao `frontend/nginx.conf`:

```nginx
location /actuator/ {
    proxy_pass http://backend:8080/actuator/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Então altere o health check no frontend para uma URL relativa:

```ts
axios.get('/actuator/health');
```

O caminho passa a ser:

```text
Navegador -> localhost:3000/actuator/health
          -> Nginx -> backend:8080/actuator/health
```

O [application.properties](../backend/src/main/resources/application.properties) configura CORS para os endpoints do Actuator. Essa configuração é relevante quando o navegador acessa outra origem diretamente. Ao usar o proxy na mesma origem, o navegador não precisa de CORS para essa chamada. Ainda assim, publicar Actuator merece cuidado: evite disponibilizar detalhes operacionais desnecessários publicamente. O arquivo atual configura `management.endpoint.health.show-details=always`.

## 8. Publicação da porta do backend

O Compose atualmente publica a porta do backend:

```yaml
backend:
  ports:
    - "8080:8080"
```

O formato é `porta-do-host:porta-do-container`:

```text
localhost:8080 na máquina -> porta 8080 do container backend
```

Se remover `ports` do serviço `backend`, os outros containers da rede Compose continuam podendo chamar `backend:8080`. O que deixa de funcionar é o acesso direto a partir da máquina, como `http://localhost:8080`.

### Vantagens de não publicar a porta

- reduz os pontos de entrada expostos no host;
- faz o tráfego normal passar pelo Nginx;
- permite testar o backend pelo mesmo caminho usado pelo frontend.

### Impactos em desenvolvimento

- Postman, navegador, curl e ferramentas na máquina deixam de acessar `localhost:8080`;
- chamadas por `http://localhost:3000/api/...` continuam funcionando se o proxy estiver configurado;
- se for necessário depurar a API diretamente, mantenha a porta publicada ou use uma configuração Compose específica para desenvolvimento.

Publicar `8080` é conveniente para desenvolvimento e diagnóstico. Em produção, costuma ser melhor deixar o backend acessível apenas na rede interna e publicar somente o ponto de entrada apropriado, normalmente um proxy ou load balancer. O backend sem porta publicada não fica completamente isolado: todos os serviços conectados à rede Docker ainda podem tentar acessá-lo.

## 9. Testar endpoints

Com o frontend e o proxy em execução, o Postman pode testar a API por:

```text
GET http://localhost:3000/api/projects
```

Para criar um projeto:

```http
POST http://localhost:3000/api/projects
Content-Type: application/json
```

Corpo de exemplo:

```json
{
  "title": "Projeto de teste",
  "description": "Testando a API pelo proxy",
  "technologies": ["React", "Spring Boot"]
}
```

O controller define `POST /api/projects`. A resposta esperada para uma criação bem-sucedida é `201 Created`.

Se a porta `8080` continuar publicada, também é possível testar diretamente:

```text
GET  http://localhost:8080/api/projects
POST http://localhost:8080/api/projects
```

Testar por `localhost:3000` verifica o caminho completo pelo Nginx. Testar por `localhost:8080` pula o proxy e é útil para isolar problemas do backend.

## 10. Reconstruir depois de alterações

O frontend é compilado durante a criação da imagem. Alterações em `frontend/src`, como `api.ts`, ou em `frontend/nginx.conf` precisam entrar em uma nova imagem.

Na raiz do repositório:

```bash
docker compose -f docker/docker-compose.yml up -d --build frontend
```

Esse comando reconstrói e recria o serviço frontend sem exigir `docker compose down` antes. Para reconstruir e iniciar toda a stack, por exemplo depois de alterar o Compose:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

Depois, acesse `http://localhost:3000`. Se o navegador mantiver arquivos antigos em cache, faça um recarregamento forçado (`Ctrl+Shift+R`).

## 11. Mensagem de commit

Para registrar a mudança da URL base do frontend para usar o proxy, uma mensagem no estilo Conventional Commits pode ser:

```text
fix(frontend): usa rota relativa da API pelo proxy do Nginx
```

`fix` descreve uma correção do fluxo de chamadas. Uma alternativa em inglês é:

```text
fix(frontend): use relative API path through Nginx proxy
```
