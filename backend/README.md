# Job Application Tracker Backend

This is the backend service for the Job Application Tracker application, built with Spring Boot 3.4.4. It provides a RESTful API for managing job applications and user accounts.

## Prerequisites

- Java 17 or higher
- Maven
- PostgreSQL database
- Environment variables (see Configuration section)

## Getting Started

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   JWT_SECRET=your_jwt_secret_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=jobtracker
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```
4. Build the project:
   ```bash
   mvn clean install
   ```
5. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080` by default.

## Database Setup

1. Create a PostgreSQL database named `jobtracker`
2. The application will automatically create the necessary tables on startup
3. Make sure your database credentials match those in your `.env` file

## Authentication

The application uses JWT (JSON Web Token) for authentication. Here's how it works:

1. Users register with username, password, and email
2. Users login with username and password to receive a JWT token
3. The token must be included in subsequent requests in the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## API Endpoints

### User Management

#### Authentication
- `POST /api/users/login` - Login user and get JWT token
- `POST /api/users/register` - Register new user

#### User Operations
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `GET /api/users/email/{email}` - Get user by email
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### User Profile
- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update current user's profile
- `PUT /api/profile/change-password` - Change current user's password

### Job Applications
- `GET /api/applications` - Get all applications (filtered by user)
- `GET /api/applications/{id}` - Get application by ID
- `POST /api/applications` - Create new application
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

### Contacts (per Application)
- `GET /api/applications/{applicationId}/contacts` - Get all contacts for an application
- `GET /api/applications/{applicationId}/contacts/{contactId}` - Get specific contact
- `POST /api/applications/{applicationId}/contacts` - Create new contact
- `PUT /api/applications/{applicationId}/contacts/{contactId}` - Update contact
- `DELETE /api/applications/{applicationId}/contacts/{contactId}` - Delete contact

### Interviews (per Application)
- `GET /api/applications/{applicationId}/interviews` - Get all interviews for an application
- `GET /api/applications/{applicationId}/interviews/{interviewId}` - Get specific interview
- `POST /api/applications/{applicationId}/interviews` - Create new interview
- `PUT /api/applications/{applicationId}/interviews/{interviewId}` - Update interview
- `DELETE /api/applications/{applicationId}/interviews/{interviewId}` - Delete interview

## Security Features

- JWT-based authentication using JJWT 0.11.5
- Password encryption using BCrypt
- Role-based access control (ROLE_USER, ROLE_ADMIN)
- Protected endpoints with proper authorization
- Input validation and sanitization
- Global exception handling

## Error Handling

The application includes comprehensive error handling in the `exception` package for:
- Resource not found
- Resource already exists
- Bad requests
- Authentication failures
- Access denied
- Database connection issues
- Validation errors

## Testing

The application includes comprehensive test coverage across different layers:

### Test Structure
```
backend/src/test/java/com/jnleyva/jobtracker_backend/
├── controller/     # Controller layer tests
├── service/       # Service layer tests
└── config/        # Configuration tests
```

### Test Features
- Unit tests for all controllers, services, and configurations
- Integration tests using H2 in-memory database
- Security tests for authentication and authorization
- Exception handling tests
- Validation tests

### Running Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserControllerTest

# Run tests with coverage report
mvn test jacoco:report
```

The test suite uses H2 in-memory database for testing, ensuring tests are isolated and fast.

## Development

### Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/jnleyva/jobtracker_backend/
│   │   │       ├── config/         # Configuration classes
│   │   │       ├── controller/     # REST controllers
│   │   │       ├── model/          # Entity classes
│   │   │       ├── repository/     # Data access layer
│   │   │       ├── service/        # Business logic
│   │   │       ├── security/       # Security related classes
│   │   │       ├── exception/      # Custom exceptions and handlers
│   │   │       └── filter/         # JWT filter
│   │   └── resources/
│   │       └── application.properties
└── pom.xml
```

### Key Dependencies

- Spring Boot 3.4.4
- Spring Security
- Spring Data JPA
- PostgreSQL
- JJWT 0.11.5 for JWT handling
- Lombok for reducing boilerplate code
- H2 Database for testing
- Java Dotenv for environment variable management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
