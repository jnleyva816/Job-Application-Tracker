# Job Application Tracker

A full-stack application for tracking job applications, built with Spring Boot (backend) and React (frontend - planned).

## Project Structure

```
Job_Application_Tracker/
├── backend/           # Spring Boot backend service
├── frontend/         # React frontend application (planned)
└── Job_Application_Tracker_Docs/  # Project documentation
```

## Backend

The backend is a Spring Boot application that provides a RESTful API for managing job applications and user accounts. See [backend/README.md](backend/README.md) for detailed information about:

- Setup instructions
- API endpoints
- Authentication
- Database configuration
- Development guidelines

## Frontend

The frontend is built using React with TypeScript and Vite, providing a modern, responsive user interface. It uses Tailwind CSS for styling and includes features for:
- User authentication
- Job application management
- Profile management
- Dashboard with application statistics
- Search and filtering capabilities

See [frontend/README.md](frontend/README.md) for detailed setup and development instructions.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Job_Application_Tracker.git
   cd Job_Application_Tracker
   ```

2. Set up the backend:
   ```bash
   cd backend
   # Follow instructions in backend/README.md
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development Status

- [x] Backend API implementation
- [x] Database schema and migrations
- [x] Authentication system
- [x] Frontend project setup
- [ ] Frontend feature implementation
- [ ] Integration testing
- [ ] Deployment configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spring Boot team for the excellent framework
- React team for the frontend framework (planned)
- All contributors who will help improve this project 