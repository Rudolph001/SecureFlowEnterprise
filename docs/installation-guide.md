
# SecureFlow Installation Guide

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- PostgreSQL 14+ (or Neon Database account)
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Development Environment
- Replit workspace (recommended)
- Or local development environment with above prerequisites

## Quick Start (Replit)

### 1. Clone and Setup
```bash
# Fork this Repl or clone the repository
git clone https://github.com/your-org/secureflow.git
cd secureflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/secureflow"
NEON_DATABASE_URL="your-neon-connection-string"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="24h"

# Email Integration
MICROSOFT_GRAPH_CLIENT_ID="your-microsoft-app-id"
MICROSOFT_GRAPH_CLIENT_SECRET="your-microsoft-app-secret"
MICROSOFT_GRAPH_TENANT_ID="your-tenant-id"

GMAIL_CLIENT_ID="your-gmail-client-id"
GMAIL_CLIENT_SECRET="your-gmail-client-secret"

# External Services
THREAT_INTEL_API_KEY="your-threat-intelligence-api-key"
SPLUNK_HEC_TOKEN="your-splunk-token"
SPLUNK_HEC_URL="https://your-splunk-instance.com:8088"

# Application Settings
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 4. Database Setup
```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Production Deployment (Replit)

### 1. Configure Production Environment
Update your `.env` file for production:
```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
FRONTEND_URL="https://your-repl-name.replit.app"
```

### 2. Build and Deploy
```bash
# Build the application
npm run build

# Deploy on Replit
# Use the Deploy button in Replit interface
```

### 3. Domain Configuration
- Configure custom domain in Replit Deployments
- Update CORS settings in server configuration
- Configure SSL certificates (handled by Replit)

## Email Client Integration

### Microsoft Outlook Add-in

1. **Register App in Azure AD**
   - Go to Azure Portal > App Registrations
   - Create new registration
   - Configure API permissions for Microsoft Graph
   - Note Client ID and Tenant ID

2. **Deploy Add-in Manifest**
   ```bash
   # Upload manifest.xml to your organization
   # File location: addons/outlook/manifest.xml
   ```

3. **Configure Add-in Settings**
   - Update manifest.xml with your deployment URL
   - Configure trusted domains
   - Test with pilot users

### Gmail Add-on

1. **Google Cloud Console Setup**
   - Create project in Google Cloud Console
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Configure consent screen

2. **Deploy Apps Script**
   ```bash
   # Deploy the Gmail add-on
   # File location: addons/gmail/gmail-addon.js
   ```

## SIEM Integration

### Splunk Integration

1. **Configure Splunk HEC**
   - Enable HTTP Event Collector in Splunk
   - Create new HEC token
   - Configure index for security events

2. **Update Configuration**
   ```bash
   # Install Python dependencies for Splunk forwarder
   pip install splunk-sdk requests
   ```

3. **Start Forwarder**
   ```bash
   # Run the Splunk forwarder
   python siem_integration/splunk_forwarder.py
   ```

## Monitoring and Logging

### Application Monitoring
- Logs are output to console in development
- Production logs stored in `/logs` directory
- Real-time metrics available via WebSocket

### Health Checks
- Health endpoint: `GET /api/health`
- Database connectivity: `GET /api/health/db`
- External services: `GET /api/health/services`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Test database connection
   npm run db:test-connection
   ```

2. **Email Integration Problems**
   ```bash
   # Verify API credentials
   npm run test:email-integration
   ```

3. **Build Issues**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm run build
   ```

### Support
- Check logs: `npm run logs`
- Run diagnostics: `npm run diagnose`
- Contact support with error details

## Security Considerations

### Development Security
- Never commit secrets to version control
- Use environment variables for all credentials
- Enable 2FA on all external service accounts

### Production Security
- Use HTTPS only
- Configure proper CORS settings
- Implement rate limiting
- Regular security updates

## Next Steps

1. **Configure Policies**: Access Policy Builder to create security rules
2. **Set Up Users**: Configure user management and roles
3. **Test Integration**: Send test emails through connected clients
4. **Monitor Dashboard**: Check real-time security metrics
5. **Train Users**: Conduct security awareness training

For advanced configuration and enterprise deployment, see the Architecture Guide.
