# Expense Tracker

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-repo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A full stack web application to track your expenses, manage income, and plan places to visit. Built with Spring Boot (Java 17) for the backend and vanilla JavaScript, HTML, and CSS for the frontend.

---

## Features
- User registration and authentication (JWT-based)
- Add, edit, and delete expenses and income
- Categorize transactions
- Credit card limit and summary
- Financial summary dashboard
- Search, filter, and export transactions to CSV
- Manage a list of places to visit with estimated costs
- Responsive, modern UI with custom SVG graphics

---

## Tech Stack
- **Backend:** Spring Boot 3.2.5, Spring Security, Spring Data JPA, Hibernate, PostgreSQL
- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Authentication:** JWT (JSON Web Token)
- **API Docs:** Swagger/OpenAPI
- **Build Tool:** Maven
- **Containerization:** Docker (optional)

---

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 13+

### Clone the Repository
```bash
git clone https://github.com/your-repo/project.git
cd project
```

### Database Setup
1. Create a PostgreSQL database named `track`.
2. Update `src/main/resources/application.properties` if you change the default credentials:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/track
    spring.datasource.username=postgres
    spring.datasource.password=your_password
    ```

### Build & Run (Maven)
```bash
cd project
mvn clean install
mvn spring-boot:run
```
The backend will start on [http://localhost:8080](http://localhost:8080)

### Frontend
The frontend is served automatically by Spring Boot at [http://localhost:8080](http://localhost:8080).
Open your browser and navigate to this URL.

---

## Configuration

- **JWT Secret:** Set `jwt.secret` in `application.properties` to a secure value.
- **Swagger UI:** Available at `/swagger-ui.html` when the server is running.

---

## Docker (Optional)
If you have a `docker-compose.yml` and `Dockerfile`, you can run:
```bash
docker-compose up --build
```

---

## API Documentation
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- OpenAPI Docs: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## Usage
1. Register a new account or log in.
2. Add your income and expenses, categorize them, and view summaries.
3. Set and track your credit card limit.
4. Add places you want to visit and estimate costs.
5. Use filters and export your data as needed.

---

## Folder Structure
```
project/
  ├── src/main/java/com/example/project/         # Backend source code
  ├── src/main/resources/static/                 # Frontend (HTML, JS, CSS)
  ├── src/main/resources/application.properties  # App configuration
  ├── pom.xml                                   # Maven build file
  └── ...
```

---

## Credits
- Developed by [Your Name]
- Inspired by modern personal finance tools

---

## License
This project is licensed under the MIT License.


# 🚀 Spring Boot + PostgreSQL Dockerized Application

This project is a sample Spring Boot application connected to a PostgreSQL database using Docker and Docker Compose. The backend is containerized and ready to be deployed or tested across any environment.

---

## 🧱 Project Structure

- **Spring Boot App** - Java 17-based REST API
- **PostgreSQL** - For relational database storage
- **Docker** - To containerize the application
- **Docker Compose** - To manage multi-container deployment

---

## 🐳 DockerHub Image

📦 **Docker Image:** [`harish82476/my-app-name`](https://hub.docker.com/r/harish82476/my-app-name)

To pull the image on any machine:

```bash
docker pull harish82476/my-app-name:latest
