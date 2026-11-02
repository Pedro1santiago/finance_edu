FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sh ./mvnw -q -B dependency:go-offline
COPY src src
RUN sh ./mvnw -q -B -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/finance-edu-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
