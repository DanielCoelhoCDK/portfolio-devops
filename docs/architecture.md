# Decisões de Arquitetura

Este documento registra as principais decisões técnicas do Portfolio DevOps, seus motivos e os limites conhecidos da implementação atual.

## Visão geral

A aplicação é executada como três serviços na rede Docker `devops-network`:

```text
+----------------------+       /api/        +----------------------+
| React SPA            | -----------------> | Spring Boot API      |
| Nginx :80            |                    | :8080                |
+----------------------+                    +----------+-----------+
        ^                                              |
        | localhost:3000                               | JDBC
        |                                              v
+-------+--------------+                    +----------------------+
| Navegador            |                    | PostgreSQL 16        |
+----------------------+                    | :5432                |
                                             +----------------------+
```

As portas publicadas no host são `3000` para o frontend, `8080` para o backend e `5432` para o PostgreSQL.

## Decisão 1: multi-stage build com Nginx

### Contexto

O frontend React precisa de Node.js, npm e das dependências de desenvolvimento apenas durante a compilação. Depois do comando `npm run build`, a aplicação é uma SPA estática composta pelos arquivos gerados em `dist/`.

### Decisão

O `frontend/Dockerfile` usa um build multi-stage:

1. A etapa `builder` usa `node:20-alpine`, instala as dependências com `npm ci` e executa `npm run build`.
2. A etapa final usa `nginx:alpine`, copia somente `dist/` para `/usr/share/nginx/html` e inicia o Nginx.
3. O `nginx.conf` configura o fallback para `index.html`, necessário para que as rotas da SPA funcionem após um refresh.
4. O mesmo Nginx encaminha as requisições `/api/` para `backend:8080` dentro da rede Docker.

```text
+---------------------------+       +--------------------------+
| Etapa de build            |       | Imagem de runtime        |
| node:20-alpine            |       | nginx:alpine             |
| npm ci                    | ----> | arquivos estáticos dist/ |
| npm run build             |       | Nginx :80                |
+---------------------------+       +--------------------------+
```

### Motivos

- **Imagem final menor:** Node.js, npm, código-fonte e dependências de desenvolvimento não são enviados para produção.
- **Menor superfície de ataque:** o runtime expõe apenas o servidor Nginx necessário para servir os arquivos.
- **Separação de responsabilidades:** Node.js compila; Nginx serve conteúdo estático e atua como proxy reverso.
- **Entrega previsível:** `npm ci` instala exatamente o lockfile disponível no projeto.
- **Compatibilidade com SPA:** `try_files` permite que o React Router, quando usado, resolva as rotas no cliente.

### Trade-offs e operação

- A imagem precisa ser reconstruída quando o código ou as dependências do frontend mudam:

  ```bash
  docker compose -f docker/docker-compose.yml up --build -d frontend
  ```

- O proxy `/api/` depende de o serviço se chamar `backend` na rede Compose. Alterar o nome do serviço exige atualizar o `nginx.conf`.
- O backend continua publicado em `8080` para desenvolvimento e diagnóstico, embora o fluxo normal do navegador use o proxy do Nginx.

## Decisão 2: healthcheck do PostgreSQL

### Contexto

A API depende do PostgreSQL para iniciar corretamente. Apenas criar ou iniciar o container do banco não garante que o servidor já esteja aceitando conexões.

### Decisão

O serviço `database` no `docker/docker-compose.yml` possui um healthcheck baseado no utilitário oficial `pg_isready`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U devops_user -d portfolio_db"]
  interval: 5s
  timeout: 5s
  retries: 5
```

A verificação consulta diretamente o banco `portfolio_db` com o usuário configurado. O intervalo de cinco segundos, o timeout de cinco segundos e as cinco tentativas estabelecem uma janela curta para detectar prontidão sem criar uma espera fixa desnecessária.

### Motivos

- **Sinal de prontidão real:** o resultado representa a capacidade do PostgreSQL de aceitar conexões, não apenas o estado do processo.
- **Orquestração observável:** o Compose pode expor o estado `healthy` do serviço para diagnóstico.
- **Inicialização repetível:** a checagem funciona da mesma forma em máquinas de desenvolvimento e em pipelines que usam Compose.
- **Baixo custo:** `pg_isready` é fornecido pela imagem oficial do PostgreSQL e não exige scripts adicionais.

### Limite importante

O `backend` declara `depends_on: database`, mas a configuração atual não usa a condição `service_healthy`. Portanto, o healthcheck registra a prontidão do banco, mas não bloqueia sozinho a criação do container do backend até o estado `healthy`.

Caso seja necessário tornar a ordem dependente da saúde explicitamente, a configuração pode evoluir para:

```yaml
depends_on:
  database:
    condition: service_healthy
```

Mesmo com essa condição, a aplicação deve manter uma estratégia de retry ou falha clara para indisponibilidades posteriores ao startup. Healthcheck resolve coordenação inicial; não substitui resiliência em runtime.

## Decisão 3: Design System “Industrial Digital”

### Direção visual

O design system “Industrial Digital” traduz a natureza operacional e DevOps do projeto em uma interface escura, técnica e legível. A linguagem combina:

- **Dark mode como padrão:** reduz o brilho em sessões longas e reforça a leitura de terminal, observabilidade e infraestrutura.
- **Contraste funcional:** superfícies escuras recebem texto claro, enquanto ciano e verde são reservados para foco, links, estado saudável e ações de sistema.
- **Tipografia e espaçamento consistentes:** a interface deve priorizar escaneabilidade, densidade controlada e hierarquia clara.
- **Estados explícitos:** sucesso, alerta, erro, foco e indisponibilidade devem ser distinguíveis por cor, texto e, quando necessário, ícone.
- **Detalhes de instrumentação:** bordas, indicadores de pulso e realces sutis sugerem telemetria sem transformar a interface em decoração.

A implementação atual já contém sinais dessa direção em `frontend/src/index.css`, como o fundo escuro, o ciano `#4cd7f6`, o verde de estado saudável e a animação `pulse-dot`. O frontend usa CSS próprio hoje; os tokens abaixo documentam o contrato visual e podem ser migrados para Tailwind quando a dependência for adotada.

### Tokens de referência para Tailwind

Os tokens devem ser centralizados em um tema Tailwind, evitando cores soltas nos componentes. Uma configuração futura pode seguir este contrato:

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#0b1326', // fundo principal
          900: '#111c32', // superfície elevada
          800: '#1d2a3a', // painel e borda escura
          700: '#3d494c', // borda neutra
          cyan: '#4cd7f6', // foco e ação primária
          green: '#4ae176', // estado saudável
          amber: '#f4bd50', // atenção
          red: '#f06b6b', // erro e indisponibilidade
          text: '#e7eef5', // texto principal
          muted: '#9eafbd' // texto secundário
        }
      },
      boxShadow: {
        'industrial-glow': '0 0 10px rgba(76, 215, 246, 0.2)'
      }
    }
  }
}
```

### Regras de uso

- Use `industrial-950` como fundo global e `industrial-900` para superfícies.
- Use `industrial-cyan` para foco, links e ações primárias, sempre com contraste suficiente.
- Use `industrial-green` para saúde ou operação normal; não use verde apenas como ornamento.
- Use `industrial-amber` e `industrial-red` para estados que exigem atenção ou ação.
- Reserve o efeito `industrial-glow` para foco e interação; evite sombras luminosas permanentes em toda a interface.
- Mantenha o modo claro fora do escopo inicial, mas preserve tokens semânticos para permitir uma futura variação de tema.
- Não codifique hexadecimais diretamente em componentes quando um token semântico atender ao caso.

### Acessibilidade e manutenção

- O dark mode não substitui contraste: texto, foco e estados devem continuar legíveis em telas com brilho baixo.
- Estados não devem depender exclusivamente de cor; associe rótulo, ícone ou mudança de conteúdo quando necessário.
- A animação de pulso deve respeitar `prefers-reduced-motion`.
- Tokens semânticos devem ser a única camada consumida pelos componentes; a paleta física pode mudar sem exigir refatoração da interface.

## Consequências gerais

Essas decisões mantêm o projeto simples para execução local e adequado para evoluir em pipelines de CI/CD:

- O frontend produz um artefato estático e um runtime enxuto.
- O Compose possui um sinal explícito de prontidão para o banco.
- O design visual tem uma linguagem documentada, mesmo antes da adoção formal do Tailwind.
- As escolhas são reversíveis: o Nginx pode receber cache e headers adicionais, o Compose pode endurecer as condições de dependência, e os tokens podem ser conectados a Tailwind sem alterar o contrato visual dos componentes.
