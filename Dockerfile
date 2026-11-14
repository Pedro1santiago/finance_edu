# API (backend) para o Render. Build a partir da raiz do repositório.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN sh ./mvnw -q -B dependency:go-offline
COPY backend/src src
RUN sh ./mvnw -q -B -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/finance-edu-backend-0.0.1-SNAPSHOT.jar app.jar
# Plano free do Render tem 512 MB: heap limitado a uma fração da memória do container
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
# O Render injeta PORT; a aplicação lê server.port=${PORT:8080}
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
