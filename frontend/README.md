# Job Application Tracker - Frontend

This is the frontend application for the Job Application Tracker, built with React, TypeScript, and Vite.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Prettier

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```bash
   VITE_API_URL=http://localhost:8080
   VITE_APP_NAME="Job Application Tracker"
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── src/              # Source files
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   └── App.tsx       # Root component
├── public/           # Static assets
└── index.html        # Entry HTML file
```

## Features

- Modern, responsive UI with Tailwind CSS
- Type-safe development with TypeScript
- Fast development with Vite
- Code quality tools (ESLint, Prettier)
- Environment configuration
- Production build optimization

## Development Guidelines

1. Follow the TypeScript best practices
2. Use functional components with hooks
3. Implement responsive design using Tailwind CSS
4. Write clean, maintainable code
5. Add proper documentation for components and functions

## Building for Production

1. Update the `.env.production` file with production values
2. Run the build command:
   ```bash
   npm run build
   ```
3. The production build will be in the `dist` directory

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Troubleshooting

If you encounter any issues:

1. Clear the `node_modules` directory and run `npm install` again
2. Check if all environment variables are set correctly
3. Ensure you're using the correct Node.js version
4. Check the browser console for any errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.
