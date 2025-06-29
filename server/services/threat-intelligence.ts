import { storage } from "../storage";

export interface ThreatIndicator {
  type: "domain" | "ip" | "email" | "hash";
  value: string;
  threatType: "malware" | "phishing" | "spam" | "c2";
  confidence: number;
  source: string;
  metadata?: Record<string, any>;
}

export class ThreatIntelligenceService {
  async enrichThreatData(indicators: ThreatIndicator[], tenantId: string) {
    const enrichedIndicators = [];
    
    for (const indicator of indicators) {
      // Simulate external threat intelligence API calls
      const enriched = await this.queryExternalFeeds(indicator);
      
      // Store in local threat intelligence database
      await storage.addThreatIndicator({
        tenantId,
        indicatorType: indicator.type,
        indicatorValue: indicator.value,
        threatType: indicator.threatType,
        confidence: enriched.confidence,
        source: enriched.source,
        firstSeen: new Date(),
        lastSeen: new Date(),
        metadata: enriched.metadata,
      });
      
      enrichedIndicators.push(enriched);
    }
    
    return enrichedIndicators;
  }
  
  private async queryExternalFeeds(indicator: ThreatIndicator) {
    // Simulate external threat intelligence queries
    // In production, this would query services like:
    // - VirusTotal API
    // - AbuseIPDB
    // - Malware domains feeds
    // - Custom threat intelligence platforms
    
    const mockEnrichment = {
      ...indicator,
      confidence: Math.min(indicator.confidence + 0.1, 1.0),
      source: `${indicator.source}_enriched`,
      metadata: {
        ...indicator.metadata,
        geolocation: indicator.type === "ip" ? "Unknown" : undefined,
        domainAge: indicator.type === "domain" ? Math.floor(Math.random() * 365) : undefined,
        malwareFamilies: indicator.threatType === "malware" ? ["trojan", "ransomware"] : undefined,
        lastSeenInWild: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockEnrichment;
  }
  
  async updateThreatFeeds(tenantId: string) {
    // Simulate fetching latest threat intelligence feeds
    const mockThreats: ThreatIndicator[] = [
      {
        type: "domain",
        value: `malicious-${Date.now()}.com`,
        threatType: "phishing",
        confidence: 0.9,
        source: "external_feed",
        metadata: { campaign: "banking_phish_2024" },
      },
      {
        type: "ip",
        value: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        threatType: "c2",
        confidence: 0.8,
        source: "honeypot",
        metadata: { country: "unknown" },
      },
    ];
    
    return await this.enrichThreatData(mockThreats, tenantId);
  }
  
  async checkIndicator(indicator: string, tenantId: string) {
    const threats = await storage.getThreatIntelligence(tenantId);
    return threats.find(threat => 
      threat.indicatorValue === indicator || 
      indicator.includes(threat.indicatorValue)
    );
  }
  
  async getThreatStatistics(tenantId: string) {
    const threats = await storage.getThreatIntelligence(tenantId);
    
    const stats = {
      total: threats.length,
      maliciousDomains: threats.filter(t => t.indicatorType === "domain").length,
      suspiciousIPs: threats.filter(t => t.indicatorType === "ip").length,
      phishingCampaigns: threats.filter(t => t.threatType === "phishing").length,
      malwareIndicators: threats.filter(t => t.threatType === "malware").length,
      avgConfidence: threats.length > 0 
        ? threats.reduce((acc, t) => acc + t.confidence, 0) / threats.length 
        : 0,
      recentThreats: threats.filter(t => 
        new Date().getTime() - t.lastSeen.getTime() < 24 * 60 * 60 * 1000
      ).length,
    };
    
    return stats;
  }
}
