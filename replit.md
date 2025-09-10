# Overview

FitGenius is a comprehensive fitness tracking and meal planning web application that combines AI-powered workout generation, nutrition tracking, calorie monitoring, and smart alarm systems. The application helps users achieve their fitness goals through personalized workout plans, meal recommendations, and progress tracking with an intuitive dashboard interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with structured error handling
- **Development**: Hot reload using Vite middleware integration
- **Build**: esbuild for production bundling

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing
- **Session Management**: PostgreSQL session store using connect-pg-simple

## Database Schema Design
- **Users**: Core user profile with fitness metrics (age, weight, height, goals, calorie targets)
- **Workout Plans**: AI-generated personalized workout routines stored as JSON
- **Calorie Entries**: Food intake tracking with nutritional information
- **Workout Alarms**: Smart notification system with scheduling capabilities
- **Progress Entries**: User progress tracking over time

## Authentication and Authorization
- Session-based authentication using PostgreSQL session storage
- User identification through unique usernames
- Password-based authentication (ready for enhancement with hashing)

## External Dependencies

### AI Services
- **OpenAI API**: GPT-5 integration for generating personalized workout plans, meal recommendations, and food calorie analysis
- **API Configuration**: Environment-based API key management with fallback options

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database URL**: Environment-based connection string configuration

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management
- **Embla Carousel**: Touch-friendly carousel components

### Development Tools
- **Replit Integration**: Runtime error overlay and cartographer plugins for development
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Vite**: Fast development server with HMR and production building

### Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **Zod**: Runtime type validation and schema definition
- **nanoid**: Unique ID generation

## Key Features
- **AI-Powered Personalization**: Custom workout and meal plan generation based on user profiles
- **Real-time Notifications**: Browser notifications with snooze functionality for workout reminders
- **Progress Tracking**: Comprehensive fitness and nutrition progress monitoring
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Type Safety**: End-to-end TypeScript with shared schema validation