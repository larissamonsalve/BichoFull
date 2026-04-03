# Estágio 1: Build do Java com Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copia o pom.xml e a pasta src para dentro do Docker
COPY backend/pom.xml .
COPY backend/src ./src
# Compila o projeto gerando o arquivo .jar
RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM eclipse-temurin:21-jre
WORKDIR /app
# Pega apenas o arquivo compilado do estágio anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Comando para ligar o servidor
ENTRYPOINT ["java", "-jar", "app.jar"]