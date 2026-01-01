# Supply Chain Management (SCM) System

A comprehensive Supply Chain Management system built with a Spring Boot backend and a Next.js frontend.

## Prerequisites

Before running the project, ensure you have the following installed:

*   **Java Development Kit (JDK) 17** or higher
*   **Node.js** (v18 or higher) and **npm**
*   **PostgreSQL** (Optional if using the provided cloud configuration)

## Getting Started

### Backend (scm-server)

The backend is a Spring Boot application.

1.  **Navigate to the server directory:**
    ```bash
    cd scm-server
    ```

2.  **Configuration:**
    The application is pre-configured to connect to a Neon PostgreSQL database. You can check `src/main/resources/application.properties` for details.

3.  **Run the application:**
    You can run the application using the Maven Wrapper (recommended) or your local Maven installation.

    **Using local Maven (Portable):**
    ```powershell
    ..\maven_tool\apache-maven-3.9.6\bin\mvn spring-boot:run
    ```

4.  **Verify Backend is Running:**
    Once started, the server runs on port `8080`.
    You can access the API documentation (Swagger UI) at:
    [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Frontend (scm-client)

The frontend is a Next.js application using Tailwind CSS.

1.  **Navigate to the client directory:**
    ```bash
    cd scm-client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Access the Application:**
    Open your browser and visit:
    [http://localhost:3000](http://localhost:3000)

## Project Structure

*   **`scm-server/`**: Spring Boot Backend application containing REST APIs, database models, and business logic.
*   **`scm-client/`**: Next.js Frontend application containing the UI, pages, and components.
