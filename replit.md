# Overview

This is a full-stack web application built with React and Express, featuring a dashboard for analyzing load negotiation logs. The application provides data visualization and analytics for trucking load negotiations, including outcome tracking, sentiment analysis, and financial metrics. It uses a modern tech stack with TypeScript throughout and implements a clean separation between client and server code.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React 18 and TypeScript, using Vite as the build tool. The application follows a component-based architecture with:

- **UI Framework**: shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Data Visualization**: Recharts for charts and analytics dashboards

The frontend implements a dashboard-focused design with search, filtering, and data export capabilities.

## Backend Architecture
The server uses Express.js with TypeScript and follows a modular structure:

- **Framework**: Express.js with middleware for JSON parsing and request logging
- **Development Setup**: Hot reloading with tsx and Vite integration for development
- **API Structure**: RESTful API endpoints prefixed with `/api`
- **Error Handling**: Centralized error handling middleware
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Data Storage Solutions
The application is configured for PostgreSQL using Drizzle ORM:

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Type-safe schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage implementation for local development

The schema includes user management with username/password authentication structure.

## Authentication and Authorization
Basic user authentication structure is implemented:

- **User Model**: Username and password-based authentication
- **Session Management**: Prepared for session-based authentication with PostgreSQL session store
- **Security**: Passwords are stored as text (production implementation would need hashing)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Comprehensive set of accessible React components
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide React**: Icon library for consistent iconography
- **Inter Font**: Typography via Google Fonts

### Data and Utilities
- **TanStack Query**: Server state management and caching
- **date-fns**: Date manipulation and formatting
- **Recharts**: Data visualization library for charts and graphs
- **Wouter**: Lightweight routing solution
- **class-variance-authority**: Utility for managing component variants
- **clsx & tailwind-merge**: Conditional CSS class management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations for Replit platform

The application is structured for easy deployment and scaling, with clear separation of concerns and modern development practices throughout.