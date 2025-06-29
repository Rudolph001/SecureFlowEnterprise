import { storage } from "../storage";
import type { SecurityPolicy } from "@shared/schema";

export interface PolicyEvaluationContext {
  userId: number;
  userRole: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  content: string;
  attachments?: string[];
  riskScore: number;
  threatTypes: string[];
  tenantId: string;
}

export interface PolicyEvaluationResult {
  policyId: number;
  policyName: string;
  matched: boolean;
  action: "allow" | "warn" | "block" | "quarantine";
  reason: string;
  metadata?: Record<string, any>;
}

export class PolicyEngine {
  async evaluateAllPolicies(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult[]> {
    const policies = await storage.getSecurityPoliciesByTenant(context.tenantId);
    const activePolicies = policies.filter(p => p.isActive);
    
    const results: PolicyEvaluationResult[] = [];
    
    for (const policy of activePolicies) {
      const result = await this.evaluatePolicy(policy, context);
      results.push(result);
    }
    
    return results;
  }
  
  async evaluatePolicy(policy: SecurityPolicy, context: PolicyEvaluationContext): Promise<PolicyEvaluationResult> {
    const result: PolicyEvaluationResult = {
      policyId: policy.id,
      policyName: policy.name,
      matched: false,
      action: "allow",
      reason: "Policy conditions not met",
    };
    
    // Check if policy applies to this user
    if (!this.isPolicyApplicableToUser(policy, context.userId, context.userRole)) {
      return result;
    }
    
    // Evaluate policy based on type
    switch (policy.policyType) {
      case "dlp":
        return this.evaluateDLPPolicy(policy, context);
      case "phishing_protection":
        return this.evaluatePhishingPolicy(policy, context);
      case "executive_protection":
        return this.evaluateExecutivePolicy(policy, context);
      case "behavioral_analysis":
        return this.evaluateBehavioralPolicy(policy, context);
      default:
        return result;
    }
  }
  
  private isPolicyApplicableToUser(policy: SecurityPolicy, userId: number, userRole: string): boolean {
    const targetUsers = policy.targetUsers as any;
    
    if (!targetUsers || targetUsers.includes("all")) {
      return true;
    }
    
    if (Array.isArray(targetUsers)) {
      return targetUsers.includes(userId) || targetUsers.includes(userRole);
    }
    
    return false;
  }
  
  private evaluateDLPPolicy(policy: SecurityPolicy, context: PolicyEvaluationContext): PolicyEvaluationResult {
    const rules = policy.rules as any;
    const result: PolicyEvaluationResult = {
      policyId: policy.id,
      policyName: policy.name,
      matched: false,
      action: "allow",
      reason: "No DLP violations detected",
    };
    
    // Check for confidential data patterns
    const confidentialPatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /confidential|proprietary|internal|secret/i,
    ];
    
    const hasConfidentialData = confidentialPatterns.some(pattern => 
      pattern.test(context.subject) || pattern.test(context.content)
    );
    
    // Check for external recipients
    const isExternalRecipient = !context.toAddress.includes("@company.com");
    
    if (hasConfidentialData && isExternalRecipient) {
      result.matched = true;
      result.action = rules.actions?.includes("block") ? "block" : "warn";
      result.reason = "Confidential data being sent to external recipient";
      result.metadata = {
        confidentialDataDetected: true,
        externalRecipient: true,
        sensitivity: rules.sensitivity || "medium",
      };
    }
    
    return result;
  }
  
  private evaluatePhishingPolicy(policy: SecurityPolicy, context: PolicyEvaluationContext): PolicyEvaluationResult {
    const rules = policy.rules as any;
    const result: PolicyEvaluationResult = {
      policyId: policy.id,
      policyName: policy.name,
      matched: false,
      action: "allow",
      reason: "No phishing indicators detected",
    };
    
    // Check for phishing indicators
    const phishingIndicators = context.threatTypes.includes("phishing") || 
                              context.threatTypes.includes("executive_impersonation") ||
                              context.riskScore > 0.7;
    
    if (phishingIndicators) {
      result.matched = true;
      result.action = context.riskScore > 0.9 ? "quarantine" : "block";
      result.reason = "Phishing indicators detected";
      result.metadata = {
        riskScore: context.riskScore,
        threatTypes: context.threatTypes,
        sensitivity: rules.sensitivity || "high",
      };
    }
    
    return result;
  }
  
  private evaluateExecutivePolicy(policy: SecurityPolicy, context: PolicyEvaluationContext): PolicyEvaluationResult {
    const rules = policy.rules as any;
    const result: PolicyEvaluationResult = {
      policyId: policy.id,
      policyName: policy.name,
      matched: false,
      action: "allow",
      reason: "No executive protection triggers",
    };
    
    // Enhanced protection for executives
    const targetUsers = policy.targetUsers as number[];
    const isExecutive = targetUsers.includes(context.userId);
    
    if (isExecutive) {
      // Lower threshold for executives
      if (context.riskScore > 0.5 || context.threatTypes.includes("executive_impersonation")) {
        result.matched = true;
        result.action = "quarantine";
        result.reason = "Enhanced protection for executive user";
        result.metadata = {
          executiveProtection: true,
          riskScore: context.riskScore,
          threatTypes: context.threatTypes,
        };
      }
    }
    
    return result;
  }
  
  private evaluateBehavioralPolicy(policy: SecurityPolicy, context: PolicyEvaluationContext): PolicyEvaluationResult {
    const rules = policy.rules as any;
    const result: PolicyEvaluationResult = {
      policyId: policy.id,
      policyName: policy.name,
      matched: false,
      action: "allow",
      reason: "Normal behavioral patterns",
    };
    
    // Check for behavioral anomalies
    const behavioralAnomalies = context.threatTypes.includes("unusual_recipient") ||
                               context.threatTypes.includes("unusual_send_time") ||
                               context.threatTypes.includes("large_data_transfer");
    
    if (behavioralAnomalies && context.riskScore > 0.3) {
      result.matched = true;
      result.action = "warn";
      result.reason = "Unusual behavioral patterns detected";
      result.metadata = {
        behavioralAnomalies: context.threatTypes.filter(t => 
          t.includes("unusual") || t.includes("large_data")
        ),
        riskScore: context.riskScore,
      };
    }
    
    return result;
  }
  
  async createDynamicPolicy(tenantId: string, userId: number, policyTemplate: any) {
    // Create adaptive policies based on threat landscape
    const threatStats = await storage.getThreatIntelligence(tenantId);
    const recentThreats = threatStats.filter(t => 
      new Date().getTime() - t.lastSeen.getTime() < 7 * 24 * 60 * 60 * 1000
    );
    
    let dynamicRules = { ...policyTemplate.rules };
    
    // Adjust rules based on recent threat activity
    if (recentThreats.length > 10) {
      dynamicRules.sensitivity = "high";
      dynamicRules.riskThreshold = 0.6; // Lower threshold during high threat periods
    }
    
    const policy = await storage.createSecurityPolicy({
      tenantId,
      name: `Dynamic Policy - ${new Date().toISOString().split('T')[0]}`,
      description: "Auto-generated policy based on current threat landscape",
      policyType: policyTemplate.type,
      targetUsers: policyTemplate.targetUsers,
      rules: dynamicRules,
      createdBy: userId,
    });
    
    return policy;
  }
}
