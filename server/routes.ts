import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPolicySchema, insertUserSchema, insertEmailEventSchema } from "@shared/schema";
import { z } from "zod";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    tenantId: number;
    role: string;
  };
}

// Simple authentication middleware
const authenticateUser = (req: AuthenticatedRequest, res: Response, next: Function) => {
  // For demo purposes, we'll use a default authenticated user
  // In production, this would validate JWT tokens or session cookies
  req.user = {
    id: 1,
    tenantId: 1,
    role: 'security_admin',
  };
  next();
};

const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
        token: 'demo_jwt_token', // In production, generate actual JWT
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.user!.tenantId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
    }
  });

  app.get('/api/dashboard/modules', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const moduleStatus = await storage.getModuleStatus();
      res.json(moduleStatus);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch module status' });
    }
  });

  // Policy management routes
  app.get('/api/policies', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const policies = await storage.getPoliciesByTenant(req.user!.tenantId);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch policies' });
    }
  });

  app.post('/api/policies', authenticateUser, requireRole(['admin', 'security_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const policyData = insertPolicySchema.parse({
        ...req.body,
        tenantId: req.user!.tenantId,
        createdBy: req.user!.id,
      });

      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid policy data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create policy' });
    }
  });

  app.put('/api/policies/:id', authenticateUser, requireRole(['admin', 'security_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const policy = await storage.updatePolicy(id, updates);
      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }

      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update policy' });
    }
  });

  app.delete('/api/policies/:id', authenticateUser, requireRole(['admin', 'security_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePolicy(id);

      if (!success) {
        return res.status(404).json({ message: 'Policy not found' });
      }

      res.json({ message: 'Policy deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete policy' });
    }
  });

  // Email events routes
  app.get('/api/email-events', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getEmailEventsByTenant(req.user!.tenantId, limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch email events' });
    }
  });

  app.get('/api/email-events/threats', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const threats = await storage.getRecentThreatEvents(req.user!.tenantId, limit);
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch threat events' });
    }
  });

  app.post('/api/email-events', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const eventData = insertEmailEventSchema.parse({
        ...req.body,
        tenantId: req.user!.tenantId,
      });

      const event = await storage.createEmailEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid event data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create email event' });
    }
  });

  // ML Models routes
  app.get('/api/ml-models', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const models = await storage.getMlModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ML models' });
    }
  });

  app.get('/api/ml-models/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const model = await storage.getMlModel(id);

      if (!model) {
        return res.status(404).json({ message: 'Model not found' });
      }

      res.json(model);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ML model' });
    }
  });

  app.put('/api/ml-models/:id', authenticateUser, requireRole(['admin', 'security_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const model = await storage.updateMlModel(id, updates);
      if (!model) {
        return res.status(404).json({ message: 'Model not found' });
      }

      res.json(model);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update ML model' });
    }
  });

  // Threat intelligence routes
  app.get('/api/threat-intelligence', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const threats = await storage.getThreatIntelligence();
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch threat intelligence' });
    }
  });

  // Alerts routes
  app.get('/api/alerts', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const alerts = await storage.getAlertsByTenant(req.user!.tenantId, limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });

  app.put('/api/alerts/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const alert = await storage.updateAlert(id, updates);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update alert' });
    }
  });

  // User management routes
  app.get('/api/users', authenticateUser, requireRole(['admin', 'security_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getUsersByTenant(req.user!.tenantId);
      // Remove sensitive data
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', authenticateUser, requireRole(['admin', 'security_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userData = insertUserSchema.parse({
        ...req.body,
        tenantId: req.user!.tenantId,
      });

      const user = await storage.createUser(userData);
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // System metrics routes
  app.get('/api/metrics', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const metricType = req.query.type as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const metrics = await storage.getSystemMetrics(metricType, limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch system metrics' });
    }
  });

  // SIEM integration endpoint
  app.post('/api/siem/events', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // This would forward events to SIEM systems like Splunk
      const { events } = req.body;

      // Mock SIEM forwarding
      console.log('Forwarding events to SIEM:', events);

      res.json({ message: 'Events forwarded to SIEM successfully', count: events?.length || 0 });
    } catch (error) {
      res.status(500).json({ message: 'Failed to forward events to SIEM' });
    }
  });

  // Email add-in webhook endpoints
  app.post('/api/addins/outlook/warning', async (req, res) => {
    try {
      const { messageId, recipient, riskScore, warningType } = req.body;

      // Log the warning event
      console.log('Outlook add-in warning:', { messageId, recipient, riskScore, warningType });

      res.json({ 
        showWarning: riskScore > 0.7,
        message: riskScore > 0.9 ? 'High risk email detected' : 'Potentially risky email',
        warningLevel: riskScore > 0.9 ? 'critical' : 'warning'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process add-in warning' });
    }
  });

  app.post('/api/addins/gmail/warning', async (req, res) => {
    try {
      const { messageId, recipient, riskScore, warningType } = req.body;

      // Log the warning event
      console.log('Gmail add-in warning:', { messageId, recipient, riskScore, warningType });

      res.json({ 
        showWarning: riskScore > 0.7,
        message: riskScore > 0.9 ? 'High risk email detected' : 'Potentially risky email',
        warningLevel: riskScore > 0.9 ? 'critical' : 'warning'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process add-in warning' });
    }
  });

  // Policy management
  app.get("/api/policies", async (req, res) => {
    try {
      const tenantId = req.headers['x-tenant-id'] || '1';
      const policies = await storage.getSecurityPoliciesByTenant(tenantId as string);
      res.json(policies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  // Policy justification submission
  app.post("/api/policies/justification", async (req, res) => {
    try {
      const { policyId, justification, emailData, userInfo } = req.body;

      // Log the justification
      const justificationLog = {
        policyId,
        userId: userInfo?.userId || 'unknown',
        justification,
        emailSubject: emailData?.subject || '',
        emailRecipient: emailData?.to || '',
        timestamp: new Date().toISOString(),
        approved: true // Auto-approve with justification
      };

      // In a real implementation, you'd store this in a database
      console.log('Policy justification submitted:', justificationLog);

      // You could also trigger additional workflows here:
      // - Notify compliance team
      // - Log to audit trail
      // - Send to external SIEM

      res.json({ 
        success: true, 
        message: "Justification recorded and action approved",
        logId: Date.now() // In real implementation, use proper ID
      });
    } catch (error) {
      console.error('Error processing justification:', error);
      res.status(500).json({ message: "Failed to process justification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}