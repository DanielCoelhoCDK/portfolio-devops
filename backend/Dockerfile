# Estágio 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copia arquivos do Maven Wrapper e dependências para cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Copia o código-fonte e gera o pacote (pulando os testes para agilizar)
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Estágio 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Cria usuário não-root por segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copia apenas o jar construído
COPY --from=builder /app/target/*.jar app.jar

# Variáveis de ambiente padrão
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]