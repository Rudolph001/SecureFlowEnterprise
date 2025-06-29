import { 
  users, tenants, policies, emailEvents, threatIntelligence, mlModels, 
  behaviorProfiles, alerts, systemMetrics,
  type User, type Tenant, type Policy, type EmailEvent, type ThreatIntelligence,
  type MlModel, type BehaviorProfile, type Alert, type SystemMetric,
  type InsertUser, type InsertTenant, type InsertPolicy, type InsertEmailEvent,
  type InsertThreatIntelligence, type InsertMlModel, type InsertBehaviorProfile,
  type InsertAlert, type InsertSystemMetric
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUsersByTenant(tenantId: number): Promise<User[]>;

  // Tenant management
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, updates: Partial<Tenant>): Promise<Tenant | undefined>;

  // Policy management
  getPolicy(id: number): Promise<Policy | undefined>;
  getPoliciesByTenant(tenantId: number): Promise<Policy[]>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: number, updates: Partial<Policy>): Promise<Policy | undefined>;
  deletePolicy(id: number): Promise<boolean>;

  // Email events
  createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent>;
  getEmailEventsByUser(userId: number, limit?: number): Promise<EmailEvent[]>;
  getEmailEventsByTenant(tenantId: number, limit?: number): Promise<EmailEvent[]>;
  getRecentThreatEvents(tenantId: number, limit?: number): Promise<EmailEvent[]>;

  // Threat intelligence
  getThreatIntelligence(): Promise<ThreatIntelligence[]>;
  createThreatIntelligence(threat: InsertThreatIntelligence): Promise<ThreatIntelligence>;
  updateThreatIntelligence(id: number, updates: Partial<ThreatIntelligence>): Promise<ThreatIntelligence | undefined>;

  // ML models
  getMlModels(): Promise<MlModel[]>;
  getMlModel(id: number): Promise<MlModel | undefined>;
  createMlModel(model: InsertMlModel): Promise<MlModel>;
  updateMlModel(id: number, updates: Partial<MlModel>): Promise<MlModel | undefined>;

  // Behavior profiles
  getBehaviorProfile(userId: number): Promise<BehaviorProfile | undefined>;
  createBehaviorProfile(profile: InsertBehaviorProfile): Promise<BehaviorProfile>;
  updateBehaviorProfile(userId: number, updates: Partial<BehaviorProfile>): Promise<BehaviorProfile | undefined>;

  // Alerts
  getAlert(id: number): Promise<Alert | undefined>;
  getAlertsByTenant(tenantId: number, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined>;

  // System metrics
  getSystemMetrics(metricType?: string, limit?: number): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;

  // Dashboard data
  getDashboardMetrics(tenantId: number): Promise<any>;
  getModuleStatus(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tenants: Map<number, Tenant> = new Map();
  private policies: Map<number, Policy> = new Map();
  private emailEvents: Map<number, EmailEvent> = new Map();
  private threatIntelligence: Map<number, ThreatIntelligence> = new Map();
  private mlModels: Map<number, MlModel> = new Map();
  private behaviorProfiles: Map<number, BehaviorProfile> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private systemMetrics: Map<number, SystemMetric> = new Map();

  private currentId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create default tenant
    const defaultTenant: Tenant = {
      id: 1,
      name: "Acme Corporation",
      domain: "acme.com",
      settings: { emailIntegration: "microsoft365", siemIntegration: "splunk" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(1, defaultTenant);

    // Create admin user
    const adminUser: User = {
      id: 1,
      tenantId: 1,
      username: "admin",
      email: "admin@acme.com",
      password: "hashed_password",
      firstName: "John",
      lastName: "Doe",
      role: "security_admin",
      permissions: ["all"],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, adminUser);

    // Initialize ML models
    this.initializeMlModels();
    this.initializeThreatIntelligence();
    this.initializePolicies();
    this.initializeSystemMetrics();
    this.currentId = 100;
  }

  private initializeMlModels() {
    const models = [
      {
        id: 1,
        name: "Phishing Detection Model",
        type: "phishing",
        version: "v2.4.1",
        accuracy: 0.994,
        status: "active",
        parameters: { threshold: 0.85, features: 247 },
        trainingData: { samples: 125000, lastUpdate: "2024-01-15" },
        lastTrained: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        nextTraining: new Date(Date.now() + 22 * 60 * 60 * 1000), // in 22 hours
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Data Exfiltration Model",
        type: "dlp",
        version: "v1.8.3",
        accuracy: 0.987,
        status: "active",
        parameters: { threshold: 0.80, features: 156 },
        trainingData: { samples: 98000, lastUpdate: "2024-01-12" },
        lastTrained: new Date(Date.now() - 3 * 60 * 60 * 1000),
        nextTraining: new Date(Date.now() + 21 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Behavioral Analysis Model",
        type: "behavioral",
        version: "v3.1.0",
        accuracy: 0.962,
        status: "training",
        parameters: { threshold: 0.75, features: 189 },
        trainingData: { samples: 200000, lastUpdate: "2024-01-18" },
        lastTrained: new Date(Date.now() - 1 * 60 * 60 * 1000),
        nextTraining: new Date(Date.now() + 23 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    ];

    models.forEach(model => this.mlModels.set(model.id, model as MlModel));
  }

  private initializeThreatIntelligence() {
    const threats = [
      {
        id: 1,
        type: "domain",
        value: "malicious-phishing-site.com",
        source: "VirusTotal",
        severity: "high",
        description: "Known phishing domain targeting financial institutions",
        indicators: { reputation: -95, categories: ["phishing", "malware"] },
        firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastSeen: new Date(),
        isActive: true,
      },
      {
        id: 2,
        type: "ip",
        value: "192.168.1.100",
        source: "AbuseIPDB",
        severity: "medium",
        description: "Suspicious IP with reported malicious activity",
        indicators: { confidence: 78, reports: 12 },
        firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000),
        lastSeen: new Date(),
        isActive: true,
      },
    ];

    threats.forEach(threat => this.threatIntelligence.set(threat.id, threat as ThreatIntelligence));
  }

  private initializePolicies() {
    const policies = [
      {
        id: 1,
        tenantId: 1,
        name: "Data Loss Prevention",
        type: "dlp",
        description: "Prevents confidential data from being sent to external recipients",
        rules: {
          conditions: ["contains_pii", "external_recipient"],
          actions: ["block", "alert_admin"],
          keywords: ["ssn", "credit_card", "confidential"]
        },
        targetUsers: { groups: ["all"] },
        isActive: true,
        severity: "high",
        createdBy: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        tenantId: 1,
        name: "Executive Protection",
        type: "executive_protection",
        description: "Enhanced protection for C-level executives against targeted attacks",
        rules: {
          conditions: ["executive_target", "suspicious_sender"],
          actions: ["quarantine", "alert_security_team"],
          executives: ["ceo@acme.com", "cfo@acme.com"]
        },
        targetUsers: { roles: ["executive", "c_level"] },
        isActive: true,
        severity: "critical",
        createdBy: 1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    policies.forEach(policy => this.policies.set(policy.id, policy as Policy));
  }

  private initializeSystemMetrics() {
    const metrics = [
      { id: 1, metricType: "threats_blocked", value: 1247, metadata: { period: "week" }, timestamp: new Date() },
      { id: 2, metricType: "users_protected", value: 8432, metadata: { period: "week" }, timestamp: new Date() },
      { id: 3, metricType: "emails_analyzed", value: 127000, metadata: { period: "week" }, timestamp: new Date() },
      { id: 4, metricType: "ml_accuracy", value: 99.4, metadata: { period: "month" }, timestamp: new Date() },
      { id: 5, metricType: "api_response_time", value: 127, metadata: { unit: "ms" }, timestamp: new Date() },
      { id: 6, metricType: "database_performance", value: 99.9, metadata: { unit: "percent" }, timestamp: new Date() },
    ];

    metrics.forEach(metric => this.systemMetrics.set(metric.id, metric as SystemMetric));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser,
      role: insertUser.role || 'user',
      tenantId: insertUser.tenantId || null,
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      lastLogin: null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByTenant(tenantId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.tenantId === tenantId);
  }

  // Tenant methods
  async getTenant(id: number): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(tenant => tenant.domain === domain);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = this.currentId++;
    const tenant: Tenant = { 
      ...insertTenant, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  async updateTenant(id: number, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    
    const updatedTenant = { ...tenant, ...updates, updatedAt: new Date() };
    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }

  // Policy methods
  async getPolicy(id: number): Promise<Policy | undefined> {
    return this.policies.get(id);
  }

  async getPoliciesByTenant(tenantId: number): Promise<Policy[]> {
    return Array.from(this.policies.values()).filter(policy => policy.tenantId === tenantId);
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const id = this.currentId++;
    const policy: Policy = { 
      ...insertPolicy, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.policies.set(id, policy);
    return policy;
  }

  async updatePolicy(id: number, updates: Partial<Policy>): Promise<Policy | undefined> {
    const policy = this.policies.get(id);
    if (!policy) return undefined;
    
    const updatedPolicy = { ...policy, ...updates, updatedAt: new Date() };
    this.policies.set(id, updatedPolicy);
    return updatedPolicy;
  }

  async deletePolicy(id: number): Promise<boolean> {
    return this.policies.delete(id);
  }

  // Email event methods
  async createEmailEvent(insertEvent: InsertEmailEvent): Promise<EmailEvent> {
    const id = this.currentId++;
    const event: EmailEvent = { ...insertEvent, id, timestamp: new Date() };
    this.emailEvents.set(id, event);
    return event;
  }

  async getEmailEventsByUser(userId: number, limit = 50): Promise<EmailEvent[]> {
    return Array.from(this.emailEvents.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getEmailEventsByTenant(tenantId: number, limit = 50): Promise<EmailEvent[]> {
    return Array.from(this.emailEvents.values())
      .filter(event => event.tenantId === tenantId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRecentThreatEvents(tenantId: number, limit = 10): Promise<EmailEvent[]> {
    return Array.from(this.emailEvents.values())
      .filter(event => event.tenantId === tenantId && event.threatType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Threat intelligence methods
  async getThreatIntelligence(): Promise<ThreatIntelligence[]> {
    return Array.from(this.threatIntelligence.values()).filter(threat => threat.isActive);
  }

  async createThreatIntelligence(insertThreat: InsertThreatIntelligence): Promise<ThreatIntelligence> {
    const id = this.currentId++;
    const threat: ThreatIntelligence = { 
      ...insertThreat, 
      id, 
      firstSeen: new Date(), 
      lastSeen: new Date() 
    };
    this.threatIntelligence.set(id, threat);
    return threat;
  }

  async updateThreatIntelligence(id: number, updates: Partial<ThreatIntelligence>): Promise<ThreatIntelligence | undefined> {
    const threat = this.threatIntelligence.get(id);
    if (!threat) return undefined;
    
    const updatedThreat = { ...threat, ...updates, lastSeen: new Date() };
    this.threatIntelligence.set(id, updatedThreat);
    return updatedThreat;
  }

  // ML model methods
  async getMlModels(): Promise<MlModel[]> {
    return Array.from(this.mlModels.values());
  }

  async getMlModel(id: number): Promise<MlModel | undefined> {
    return this.mlModels.get(id);
  }

  async createMlModel(insertModel: InsertMlModel): Promise<MlModel> {
    const id = this.currentId++;
    const model: MlModel = { ...insertModel, id, createdAt: new Date() };
    this.mlModels.set(id, model);
    return model;
  }

  async updateMlModel(id: number, updates: Partial<MlModel>): Promise<MlModel | undefined> {
    const model = this.mlModels.get(id);
    if (!model) return undefined;
    
    const updatedModel = { ...model, ...updates };
    this.mlModels.set(id, updatedModel);
    return updatedModel;
  }

  // Behavior profile methods
  async getBehaviorProfile(userId: number): Promise<BehaviorProfile | undefined> {
    return Array.from(this.behaviorProfiles.values()).find(profile => profile.userId === userId);
  }

  async createBehaviorProfile(insertProfile: InsertBehaviorProfile): Promise<BehaviorProfile> {
    const id = this.currentId++;
    const profile: BehaviorProfile = { ...insertProfile, id, lastUpdated: new Date() };
    this.behaviorProfiles.set(id, profile);
    return profile;
  }

  async updateBehaviorProfile(userId: number, updates: Partial<BehaviorProfile>): Promise<BehaviorProfile | undefined> {
    const profile = Array.from(this.behaviorProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates, lastUpdated: new Date() };
    this.behaviorProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Alert methods
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByTenant(tenantId: number, limit = 50): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const alert: Alert = { ...insertAlert, id, createdAt: new Date(), resolvedAt: null };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...updates };
    if (updates.status === 'resolved' && !alert.resolvedAt) {
      updatedAlert.resolvedAt = new Date();
    }
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // System metrics methods
  async getSystemMetrics(metricType?: string, limit = 100): Promise<SystemMetric[]> {
    let metrics = Array.from(this.systemMetrics.values());
    if (metricType) {
      metrics = metrics.filter(metric => metric.metricType === metricType);
    }
    return metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createSystemMetric(insertMetric: InsertSystemMetric): Promise<SystemMetric> {
    const id = this.currentId++;
    const metric: SystemMetric = { ...insertMetric, id, timestamp: new Date() };
    this.systemMetrics.set(id, metric);
    return metric;
  }

  // Dashboard methods
  async getDashboardMetrics(tenantId: number): Promise<any> {
    const metrics = await this.getSystemMetrics();
    const recentEvents = await this.getEmailEventsByTenant(tenantId, 100);
    
    return {
      threatsBlocked: metrics.find(m => m.metricType === 'threats_blocked')?.value || 0,
      usersProtected: metrics.find(m => m.metricType === 'users_protected')?.value || 0,
      emailsAnalyzed: metrics.find(m => m.metricType === 'emails_analyzed')?.value || 0,
      mlAccuracy: metrics.find(m => m.metricType === 'ml_accuracy')?.value || 0,
      apiResponseTime: metrics.find(m => m.metricType === 'api_response_time')?.value || 0,
      databasePerformance: metrics.find(m => m.metricType === 'database_performance')?.value || 0,
      recentThreats: recentEvents.filter(e => e.threatType).slice(0, 5),
    };
  }

  async getModuleStatus(): Promise<any> {
    const models = await this.getMlModels();
    return {
      guardian: { status: 'active', performance: 99.4, throughput: 2431 },
      enforcer: { status: 'active', performance: 98.7, blocked: 12 },
      defender: { status: 'active', performance: 99.7, detectionRate: 0.997 },
      architect: { status: 'training', performance: 96.2, progress: 0.65 },
      coach: { status: 'active', performance: 95.8, trainingCompleted: 15 },
      models: models.map(m => ({
        name: m.name,
        status: m.status,
        accuracy: m.accuracy,
        lastTrained: m.lastTrained,
        nextTraining: m.nextTraining,
      })),
    };
  }
}

export const storage = new MemStorage();
