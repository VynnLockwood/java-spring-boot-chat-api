---
description: Best practices for a containerized Java Spring Boot application with Docker Compose and Nginx.
---

# Java Spring Boot: Best Practices & Containerization Guide

Welcome! This skill file is designed to help you understand the foundational concepts of Java Spring Boot, architectural best practices, and how to successfully run your application using Docker Compose with an Nginx reverse proxy.

## 1. Core Architecture Basics (The "Controller-Service-Repository" Pattern)

When building Spring Boot applications, always follow a layered architecture to keep your code maintainable and testable:

- **Controllers (`@RestController`)**: The entry point for external HTTP requests (e.g., from a browser or mobile app). Controllers should be very "thin"—they only handle HTTP mechanics, input validation, and route the request to a Service. *Do not put business logic here!*
- **Services (`@Service`)**: Your business logic lives here. Services are the "brain" of your application.
- **Repositories (`@Repository`)**: Used strictly for database interactions. Spring Data JPA typically provides the CRUD methods.
- **Entities (`@Entity`)**: Classes mapped directly to your database tables.
- **DTOs (Data Transfer Objects)**: Instead of returning `Entity` objects directly to users, transform them into DTOs first. This prevents exposing internal database structures or sensitive fields (like a password hash).

### Essential Annotations (Commented Example)

```java
// 1. @SpringBootApplication is the main entry point. 
// It tells Spring to auto-configure components and scan your project for other annotations.
@SpringBootApplication 
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 2. @RestController marks this class as a request handler that returns raw data (like JSON).
@RestController 
// 3. @RequestMapping prefixes all routes in this controller with "/api/v1/users".
@RequestMapping("/api/v1/users") 
public class UserController {
    
    // 4. BEST PRACTICE: Constructor Injection
    // Instead of using @Autowired on the field, we inject the Service via the constructor.
    // This makes unit testing easier and enforces that the dependency is required.
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    // 5. @GetMapping handles HTTP GET requests
    @GetMapping 
    public List<UserDTO> getAllUsers() {
        return userService.findAllUsers();
    }
}
```

## 2. Dockerizing Spring Boot

Docker packages your application and its required environment (like the Java runtime) into a single box (an "Image"). We've created a `Dockerfile` in the root of your project:

- **Multi-stage Builds**: The provided `Dockerfile` first builds your app using Maven (Stage 1), and then copies *only* the compiled `.jar` file into a smaller Java runtime image (Stage 2). This ensures your final Docker image is lightweight and secure (no source code included).

## 3. Nginx as a Reverse Proxy

Nginx sits between the internet and your Spring Boot application. We've set up an `nginx/nginx.conf` file in your project.
- **Security Checkpoint**: It hides what port your Spring Boot app is actually running on inside the Docker network.
- **Gateway**: If you ever add a frontend (like React), Nginx can route traffic to the frontend for UI, and to the Spring Boot app for the `/api` route.

## 4. Docker Compose Setup

Docker Compose lets us define and run multi-container applications easily. The `docker-compose.yml` file links:
1. **The Spring Boot App**: Built automatically from the `Dockerfile`.
2. **Nginx**: Running on port `80`, routing traffic into the Spring Boot App.

**To run the project locally:**
```bash
# This builds the images and starts the containers in the background.
docker-compose up --build -d
```

## Extra Beginner Best Practices
- **Log thoughtfully**: Use SLF4J (built into Spring Boot) for logging via `log.info()` or `log.error()`. Don't use `System.out.println()`.
- **Global Error Handling**: Use `@ControllerAdvice` to handle exceptions globally instead of using `try/catch` in every controller.
- **Testing**: Use `@SpringBootTest` for integration tests and `@MockBean` for mocking out components.
