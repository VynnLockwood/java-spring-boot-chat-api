# Stage 1: Build the application
# We use a Maven image with Java 21 to build the .jar file.
# This prevents you from needing Maven installed locally on your machine.
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy only the pom.xml and maven wrapper first to take advantage of Docker caching.
# This way, dependencies are only re-downloaded if pom.xml changes.
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline

# Copy the actual source code and build the application
COPY src src
RUN ./mvnw package -DskipTests

# Stage 2: Create the runtime image
# We use a smaller JRE (Java Runtime Environment) image to run the app.
# Notice we don't bring the source code or Maven here, just the compiled .jar!
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar file from the "build" stage
# We assume the jar file is named loosely chatbot-*.jar depending on your pom.xml versioning.
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Command to run the Spring Boot application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
