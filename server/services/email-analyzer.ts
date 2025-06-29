import { storage } from "../storage";

export interface EmailAnalysisRequest {
  fromAddress: string;
  toAddress: string;
  subject: string;
  content: string;
  tenantId: string;
  userId: number;
}

export interface EmailAnalysisResult {
  riskScore: number;
  threatTypes: string[];
  moduleSource: string;
  actionRecommended: "allow" | "warn" | "block" | "quarantine";
  warnings: string[];
  metadata: Record<string, any>;
}

export class EmailAnalyzer {
  async analyzeEmail(request: EmailAnalysisRequest): Promise<EmailAnalysisResult> {
    const { fromAddress, toAddress, subject, content, tenantId, userId } = request;
    
    let riskScore = 0;
    const threatTypes: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};
    
    // Guardian Module - Misdirected email detection
    const guardianAnalysis = await this.analyzeGuardian(fromAddress, toAddress, subject, content, tenantId);
    riskScore = Math.max(riskScore, guardianAnalysis.riskScore);
    threatTypes.push(...guardianAnalysis.threatTypes);
    warnings.push(...guardianAnalysis.warnings);
    Object.assign(metadata, guardianAnalysis.metadata);
    
    // Enforcer Module - Data exfiltration detection
    const enforcerAnalysis = await this.analyzeEnforcer(fromAddress, toAddress, subject, content, tenantId);
    riskScore = Math.max(riskScore, enforcerAnalysis.riskScore);
    threatTypes.push(...enforcerAnalysis.threatTypes);
    warnings.push(...enforcerAnalysis.warnings);
    Object.assign(metadata, enforcerAnalysis.metadata);
    
    // Defender Module - Phishing detection
    const defenderAnalysis = await this.analyzeDefender(fromAddress, toAddress, subject, content, tenantId);
    riskScore = Math.max(riskScore, defenderAnalysis.riskScore);
    threatTypes.push(...defenderAnalysis.threatTypes);
    warnings.push(...defenderAnalysis.warnings);
    Object.assign(metadata, defenderAnalysis.metadata);
    
    // Architect Module - Behavioral analysis
    const architectAnalysis = await this.analyzeArchitect(fromAddress, toAddress, userId);
    riskScore = Math.max(riskScore, architectAnalysis.riskScore);
    threatTypes.push(...architectAnalysis.threatTypes);
    warnings.push(...architectAnalysis.warnings);
    Object.assign(metadata, architectAnalysis.metadata);
    
    // Determine action based on risk score
    let actionRecommended: "allow" | "warn" | "block" | "quarantine";
    if (riskScore >= 0.9) actionRecommended = "quarantine";
    else if (riskScore >= 0.7) actionRecommended = "block";
    else if (riskScore >= 0.4) actionRecommended = "warn";
    else actionRecommended = "allow";
    
    // Determine primary module source
    const moduleSource = this.determinePrimaryModule(threatTypes);
    
    return {
      riskScore,
      threatTypes: [...new Set(threatTypes)], // Remove duplicates
      moduleSource,
      actionRecommended,
      warnings,
      metadata,
    };
  }
  
  private async analyzeGuardian(fromAddress: string, toAddress: string, subject: string, content: string, tenantId: string) {
    let riskScore = 0;
    const threatTypes: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};
    
    // Check for external recipients
    const isExternalRecipient = !toAddress.includes("@company.com"); // Simplified domain check
    
    // Check for confidential data indicators
    const confidentialKeywords = ["confidential", "secret", "internal", "proprietary", "financial results"];
    const hasConfidentialData = confidentialKeywords.some(keyword => 
      subject.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
    );
    
    if (isExternalRecipient && hasConfidentialData) {
      riskScore = Math.max(riskScore, 0.8);
      threatTypes.push("misdirected_email");
      warnings.push("This email contains confidential information being sent externally");
      metadata.containsConfidential = true;
      metadata.externalRecipient = true;
    }
    
    // Check for unusual recipients (simplified)
    if (toAddress.includes("@gmail.com") || toAddress.includes("@yahoo.com")) {
      riskScore = Math.max(riskScore, 0.6);
      threatTypes.push("personal_email_risk");
      warnings.push("Sending to personal email address");
      metadata.personalEmailDomain = true;
    }
    
    return { riskScore, threatTypes, warnings, metadata };
  }
  
  private async analyzeEnforcer(fromAddress: string, toAddress: string, subject: string, content: string, tenantId: string) {
    let riskScore = 0;
    const threatTypes: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};
    
    // Data exfiltration patterns
    const dataExfilKeywords = ["source code", "database", "customer list", "financial data", "trade secret"];
    const hasDataExfilMarkers = dataExfilKeywords.some(keyword => 
      subject.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
    );
    
    // Check for competitor domains (simplified example)
    const competitorDomains = ["rival.com", "competitor.com", "competing-firm.com"];
    const isCompetitorRecipient = competitorDomains.some(domain => toAddress.includes(domain));
    
    if (hasDataExfilMarkers && isCompetitorRecipient) {
      riskScore = Math.max(riskScore, 0.95);
      threatTypes.push("data_exfiltration");
      warnings.push("Potential data exfiltration to competitor detected");
      metadata.competitorRecipient = true;
      metadata.dataExfilMarkers = true;
    }
    
    // Check for large attachments (mock detection)
    if (content.includes("attachment") && content.includes("large")) {
      riskScore = Math.max(riskScore, 0.5);
      threatTypes.push("large_data_transfer");
      warnings.push("Large data transfer detected");
      metadata.largeAttachment = true;
    }
    
    return { riskScore, threatTypes, warnings, metadata };
  }
  
  private async analyzeDefender(fromAddress: string, toAddress: string, subject: string, content: string, tenantId: string) {
    let riskScore = 0;
    const threatTypes: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};
    
    // Phishing indicators
    const urgencyKeywords = ["urgent", "immediate", "expires today", "act now", "verify account"];
    const hasUrgencyMarkers = urgencyKeywords.some(keyword => 
      subject.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
    );
    
    // Suspicious domains
    const suspiciousDomains = ["fake-bank.com", "phishing-site.com", "malicious.com"];
    const isSuspiciousDomain = suspiciousDomains.some(domain => fromAddress.includes(domain));
    
    // Executive impersonation
    const executiveTitles = ["ceo", "cfo", "president", "director"];
    const hasExecutiveImpersonation = executiveTitles.some(title => 
      fromAddress.toLowerCase().includes(title) || subject.toLowerCase().includes(title)
    );
    
    if (isSuspiciousDomain) {
      riskScore = Math.max(riskScore, 0.9);
      threatTypes.push("phishing");
      warnings.push("Email from known malicious domain");
      metadata.suspiciousDomain = true;
    }
    
    if (hasUrgencyMarkers && hasExecutiveImpersonation) {
      riskScore = Math.max(riskScore, 0.85);
      threatTypes.push("executive_impersonation");
      warnings.push("Potential executive impersonation with urgency tactics");
      metadata.executiveImpersonation = true;
      metadata.urgencyTactics = true;
    }
    
    // Check threat intelligence
    const threats = await storage.getThreatIntelligence(tenantId);
    const knownThreat = threats.find(threat => 
      fromAddress.includes(threat.indicatorValue) || 
      subject.includes(threat.indicatorValue) ||
      content.includes(threat.indicatorValue)
    );
    
    if (knownThreat) {
      riskScore = Math.max(riskScore, knownThreat.confidence);
      threatTypes.push("known_threat");
      warnings.push(`Matches known threat indicator: ${knownThreat.threatType}`);
      metadata.threatIntelMatch = true;
      metadata.threatSource = knownThreat.source;
    }
    
    return { riskScore, threatTypes, warnings, metadata };
  }
  
  private async analyzeArchitect(fromAddress: string, toAddress: string, userId: number) {
    let riskScore = 0;
    const threatTypes: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};
    
    // Get user behavior profile
    const profile = await storage.getBehaviorProfile(userId);
    
    if (profile) {
      // Check against common contacts
      const commonContacts = profile.commonContacts as string[] || [];
      const isUnusualRecipient = !commonContacts.includes(toAddress);
      
      if (isUnusualRecipient) {
        riskScore = Math.max(riskScore, 0.3);
        threatTypes.push("unusual_recipient");
        warnings.push("You've never emailed this person before");
        metadata.unusualRecipient = true;
      }
      
      // Check send volume patterns (simplified)
      const currentHour = new Date().getHours();
      const typicalSendTimes = profile.typicalSendTimes as number[] || [];
      const isUnusualTime = !typicalSendTimes.includes(currentHour);
      
      if (isUnusualTime) {
        riskScore = Math.max(riskScore, 0.2);
        threatTypes.push("unusual_send_time");
        warnings.push("Sending email at unusual time");
        metadata.unusualSendTime = true;
      }
    } else {
      // No profile exists, create basic one
      await storage.updateBehaviorProfile(userId, {
        tenantId: "default",
        userId,
        commonContacts: [toAddress],
        typicalSendVolume: 1,
        typicalSendTimes: [new Date().getHours()],
        riskFactors: {},
      });
    }
    
    return { riskScore, threatTypes, warnings, metadata };
  }
  
  private determinePrimaryModule(threatTypes: string[]): string {
    if (threatTypes.includes("phishing") || threatTypes.includes("known_threat")) return "defender";
    if (threatTypes.includes("data_exfiltration")) return "enforcer";
    if (threatTypes.includes("misdirected_email")) return "guardian";
    if (threatTypes.includes("unusual_recipient")) return "architect";
    return "guardian"; // Default
  }
}
