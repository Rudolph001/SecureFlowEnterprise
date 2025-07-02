# SecureFlow Enterprise Email Security Platform

## Overview

This is a comprehensive enterprise email security platform providing advanced email security capabilities. The system provides real-time email threat detection, data loss prevention, phishing protection, and user coaching through multiple security modules. Built as a full-stack application with React frontend, Express/Node.js backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT-based authentication with session management
- **API Design**: RESTful APIs with real-time WebSocket support

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Multi-tenant architecture with comprehensive security event tracking

## Key Components

### Security Modules
1. **Guardian Module**: Outbound misdirected content detection to prevent accidental data leaks
2. **Enforcer Module**: Outbound data exfiltration blocking for unauthorized personal/non-business sends
3. **Defender Module**: Inbound phishing & impersonation detection with AI-based threat analysis
4. **Architect Module**: Advanced behavioral analytics with deep policy insights
5. **Coach Module**: User coaching system and incident response workflows

### Core Services
- **Email Analysis Engine**: Real-time email content analysis and risk scoring
- **ML Models Service**: Machine learning model management and retraining pipelines
- **Policy Engine**: Dynamic policy evaluation and enforcement
- **Threat Intelligence**: External threat feed integration and enrichment
- **WebSocket Manager**: Real-time event streaming to clients

### Email Client Integration
- **Outlook Add-in**: Enterprise-grade Outlook add-in with real-time warnings
- **Gmail Add-on**: Google Workspace add-on with Apps Script integration
- **Silent Mode**: Configurable silent tracking without user warnings
- **Real-time Analysis**: Instant email analysis and threat detection

### SIEM Integration
- **Splunk Forwarder**: Real-time security event forwarding to Splunk
- **Custom SIEM Support**: Configurable event forwarding to various SIEM platforms
- **Event Enrichment**: Threat intelligence enrichment before forwarding

## Data Flow

1. **Email Ingestion**: Emails are captured via Microsoft Graph API journaling or Gmail API
2. **Analysis Pipeline**: Each email passes through multiple security modules for analysis
3. **Risk Scoring**: ML models assign risk scores based on content, sender, and behavioral patterns
4. **Policy Evaluation**: Security policies are evaluated against email metadata and content
5. **Action Determination**: System determines whether to allow, warn, block, or quarantine
6. **User Notification**: Real-time warnings shown in email clients when necessary
7. **Event Logging**: All security events are logged and forwarded to SIEM systems
8. **Behavioral Learning**: User behavior patterns are continuously updated for ML models

## External Dependencies

### Database & Infrastructure
- **Neon Database**: PostgreSQL serverless hosting for production data
- **Drizzle Kit**: Database migrations and schema management

### UI & Frontend
- **Radix UI**: Comprehensive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TanStack Query**: Powerful data synchronization for React

### Email Integration
- **Microsoft Graph API**: For Office 365 email monitoring and add-in functionality
- **Gmail API**: For Google Workspace email analysis and add-on integration
- **Apps Script**: For Gmail add-on development and deployment

### Machine Learning & Analytics
- **TensorFlow/PyTorch**: ML model training and inference (planned integration)
- **Threat Intelligence APIs**: External threat feed integration
- **Behavioral Analytics**: User behavior pattern analysis

## Deployment Strategy

### Development Environment
- **Replit**: Primary development environment with hot reload
- **Vite**: Fast development server with HMR support
- **TypeScript**: Compile-time type checking across the stack

### Production Deployment
- **Container Strategy**: Docker containerization for consistent deployments
- **Database**: Neon PostgreSQL for managed database hosting
- **Static Assets**: Vite build output served via CDN
- **Environment Variables**: Secure configuration management for API keys and secrets

### Monitoring & Observability
- **Real-time Metrics**: WebSocket-based live monitoring dashboard
- **Error Tracking**: Centralized error logging and monitoring
- **Performance Monitoring**: API response time and database performance tracking

## Changelog

Changelog:
- July 2, 2025. Implemented functional Security Events Timeline in Analytics page with interactive timeline, real-time events, and export capabilities
- July 2, 2025. Created professional training details modal for Coach module "View Details" button with comprehensive analytics and learning path management
- July 2, 2025. Replaced basic browser alerts with professional toast notifications throughout Guardian investigation modal
- July 2, 2025. Added click handlers to all action buttons in investigation modal (Block & Quarantine, User Training, Create Alert, Export Report, Save Investigation)
- July 2, 2025. Created professional investigation modal with tabbed interface replacing simple alert
- July 2, 2025. Fixed missing "Investigate" button functionality in Guardian module misdirected email detection
- July 2, 2025. Created Outlook COM add-in for local testing with manifest, taskpane, and commands
- July 2, 2025. Completed migration from Replit Agent to standard Replit environment
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.