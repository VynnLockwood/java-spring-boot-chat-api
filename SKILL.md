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

## 3. The Frontend (Vite + React)

We've added a modern Vite-based React frontend to this application. Vite is an incredibly fast build tool that instantly starts a development server and bundles your React code for production.
- During development, you can run `npm run dev` in the `frontend` directory.
- For production, Docker builds the static React files (`dist` folder) and serves them using a lightweight internal Nginx container.

## 4. Nginx as a Reverse Proxy

Nginx (running on port `23000`) acts as the single entry point (the "front door") to your entire application.
- **Routing**: If a user visits `/`, Nginx routes the traffic to the Vite React Frontend. If they visit `/api/`, Nginx routes the traffic to the Spring Boot App. Portainer is accessed via `/portainer/`.
- **Security**: It hides what ports your actual components run on, exposing only an organized front to the user.

## 5. Docker Compose & Portainer

Docker Compose lets us define and run all our multi-container applications easily. Our `docker-compose.yml` links:
1. **The Spring Boot API**
2. **The React Frontend**
3. **The Nginx Reverse Proxy** (routing traffic securely)
4. **Portainer** (A powerful web-based UI to manage your Docker containers natively)

### Accessing Your Application

After you run:
```bash
docker-compose up --build -d
```

You can access your whole environment:
- **Your Web Application**: `http://localhost:23000` (Served by Nginx, showing the Vite React App)
- **Your API Endpoints**: `http://localhost:23000/api/...` (Routed behind the scenes to Spring Boot)
- **Portainer Dashboard**: `http://localhost:23000/portainer/` (Manage your containers visually!)

## Extra Beginner Best Practices
- **Log thoughtfully**: Use SLF4J (built into Spring Boot) for logging via `log.info()` or `log.error()`. Don't use `System.out.println()`.
- **Global Error Handling**: Use `@ControllerAdvice` to handle exceptions globally instead of using `try/catch` in every controller.
- **Testing**: Use `@SpringBootTest` for integration tests and `@MockBean` for mocking out components.
