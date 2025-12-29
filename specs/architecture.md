# System Architecture Specification

## Overview
This document specifies the system architecture for Hackathon II - The Evolution of Todo, detailing the structure, components, and interactions between frontend, backend, and database layers.

## Architecture Style
- **Pattern**: Client-Server with REST API
- **Architecture**: Three-tier (Presentation, Application, Data)
- **Communication**: HTTP/HTTPS with JSON payloads
- **Authentication**: JWT-based with Better Auth integration

## System Components

### Frontend (Client Tier)
- **Technology**: Next.js 16+, React, TypeScript
- **Responsibilities**:
  - User interface rendering
  - Client-side state management
  - API communication
  - User authentication handling
  - Form validation
- **Location**: `frontend/` directory

### Backend (Application Tier)
- **Technology**: FastAPI, Python 3.11+
- **Responsibilities**:
  - Business logic implementation
  - API endpoint handling
  - Authentication and authorization
  - Database operations
  - Request validation
- **Location**: `backend/` directory

### Database (Data Tier)
- **Technology**: PostgreSQL with SQLModel
- **Responsibilities**:
  - Data persistence
  - Data integrity
  - Query optimization
  - Index management
- **Location**: External PostgreSQL instance or container

## Technology Stack

### Frontend Stack
- **Framework**: Next.js 16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth Library**: Better Auth client
- **State Management**: React hooks
- **Package Manager**: pnpm

### Backend Stack
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLModel
- **Database**: PostgreSQL
- **Authentication**: JWT with Better Auth patterns
- **Dependencies Manager**: pip/UV

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Environment**: Node.js 18+, Python 3.11+
- **Protocol**: HTTPS/HTTP
- **Data Format**: JSON

## Data Flow

### Task Creation Flow
1. User submits task via frontend form
2. Frontend validates input and sends POST request to backend
3. Backend validates request and JWT token
4. Backend creates task in database
5. Backend returns created task object
6. Frontend updates UI with new task

### Authentication Flow
1. User enters credentials on frontend
2. Frontend sends credentials to backend login endpoint
3. Backend validates credentials and creates JWT
4. Backend returns JWT to frontend
5. Frontend stores JWT and redirects to dashboard
6. Frontend includes JWT in subsequent requests

## API Communication

### Frontend to Backend
- **Protocol**: HTTPS
- **Format**: JSON over HTTP
- **Authentication**: JWT in Authorization header
- **Endpoints**: `/api/*` routes

### Backend to Database
- **Protocol**: PostgreSQL protocol
- **Format**: SQL via SQLModel/SQLAlchemy
- **Connection**: Connection pooling
- **Security**: Parameterized queries to prevent injection

## Security Architecture

### Authentication Layer
- JWT tokens with expiration
- Better Auth client integration
- Secure token storage (HTTP-only cookies or secure localStorage)
- Token refresh mechanisms

### Authorization Layer
- User ID validation in all requests
- Task ownership verification
- Role-based access control (if implemented)
- Permission checks on all operations

### Data Protection
- Input validation at all layers
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure communication (HTTPS)

## Deployment Architecture

### Development Environment
- Local PostgreSQL instance
- FastAPI development server
- Next.js development server
- Hot reloading enabled

### Production Environment
- Containerized deployment (Docker)
- Reverse proxy (nginx/traefik)
- Load balancing (if needed)
- SSL termination
- Database backup and recovery

## Performance Considerations

### Caching Strategy
- Client-side caching (browser cache, service workers)
- API response caching (if applicable)
- Database query optimization
- CDN for static assets

### Scalability
- Stateless API design
- Database connection pooling
- Horizontal scaling capability
- Load balancing readiness

## Error Handling Architecture

### Client-Side Error Handling
- Form validation errors
- Network error handling
- User-friendly error messages
- Graceful degradation

### Server-Side Error Handling
- HTTP status code compliance
- Structured error responses
- Logging and monitoring
- Exception handling patterns

## Monitoring and Logging

### Backend Logging
- Request/response logging
- Error logging
- Performance metrics
- Security event logging

### Frontend Monitoring
- User interaction tracking
- Performance metrics
- Error reporting
- Usage analytics

## Integration Points

### External Services
- PostgreSQL database
- Better Auth (client-side patterns)
- Third-party authentication (future)

### Internal Components
- Frontend-Backend API contract
- Backend-Database ORM layer
- Authentication service integration