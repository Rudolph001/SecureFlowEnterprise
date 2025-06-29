import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Multi-tenant support
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users with RBAC
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // admin, security_admin, user
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security policies
export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // dlp, phishing, executive_protection, behavioral
  description: text("description"),
  rules: jsonb("rules").notNull(),
  targetUsers: jsonb("target_users"),
  isActive: boolean("is_active").default(true),
  severity: text("severity").default("medium"), // low, medium, high, critical
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email events and analysis
export const emailEvents = pgTable("email_events", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: integer("user_id").references(() => users.id),
  messageId: text("message_id").notNull(),
  sender: text("sender").notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  direction: text("direction").notNull(), // inbound, outbound
  riskScore: real("risk_score").default(0),
  threatType: text("threat_type"), // phishing, malware, dlp, impersonation
  detectionModule: text("detection_module"), // guardian, enforcer, defender, architect
  action: text("action"), // blocked, warned, allowed, quarantined
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Threat intelligence
export const threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // domain, ip, hash, url
  value: text("value").notNull(),
  source: text("source").notNull(),
  severity: text("severity").notNull(),
  description: text("description"),
  indicators: jsonb("indicators"),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// ML models
export const mlModels = pgTable("ml_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // phishing, dlp, behavioral, impersonation
  version: text("version").notNull(),
  accuracy: real("accuracy"),
  status: text("status").default("active"), // active, training, deprecated
  parameters: jsonb("parameters"),
  trainingData: jsonb("training_data"),
  lastTrained: timestamp("last_trained"),
  nextTraining: timestamp("next_training"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User behavior profiles
export const behaviorProfiles = pgTable("behavior_profiles", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: integer("user_id").references(() => users.id),
  profile: jsonb("profile").notNull(), // behavioral patterns, common contacts, etc.
  lastUpdated: timestamp("last_updated").defaultNow(),
  baseline: jsonb("baseline"),
  anomalyScore: real("anomaly_score").default(0),
});

// Security alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: integer("user_id").references(() => users.id),
  eventId: integer("event_id").references(() => emailEvents.id),
  alertType: text("alert_type").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open"), // open, investigating, resolved, false_positive
  assignedTo: integer("assigned_to").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// System metrics
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(),
  value: real("value").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Create insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailEventSchema = createInsertSchema(emailEvents).omit({ id: true, timestamp: true });
export const insertThreatIntelligenceSchema = createInsertSchema(threatIntelligence).omit({ id: true, firstSeen: true, lastSeen: true });
export const insertMlModelSchema = createInsertSchema(mlModels).omit({ id: true, createdAt: true });
export const insertBehaviorProfileSchema = createInsertSchema(behaviorProfiles).omit({ id: true, lastUpdated: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertSystemMetricSchema = createInsertSchema(systemMetrics).omit({ id: true, timestamp: true });

// Types
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type ThreatIntelligence = typeof threatIntelligence.$inferSelect;
export type MlModel = typeof mlModels.$inferSelect;
export type BehaviorProfile = typeof behaviorProfiles.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type SystemMetric = typeof systemMetrics.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type InsertEmailEvent = z.infer<typeof insertEmailEventSchema>;
export type InsertThreatIntelligence = z.infer<typeof insertThreatIntelligenceSchema>;
export type InsertMlModel = z.infer<typeof insertMlModelSchema>;
export type InsertBehaviorProfile = z.infer<typeof insertBehaviorProfileSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
