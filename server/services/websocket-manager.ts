import { WebSocketServer, WebSocket } from "ws";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: Date;
}

export interface ClientConnection {
  ws: WebSocket;
  tenantId: string;
  userId: number;
  subscriptions: string[];
}

export class WebSocketManager {
  private clients: Map<WebSocket, ClientConnection> = new Map();
  
  constructor(private wss: WebSocketServer) {
    this.setupWebSocketServer();
  }
  
  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket, request) => {
      console.log("New WebSocket connection established");
      
      ws.on("message", (rawMessage: Buffer) => {
        try {
          const message = JSON.parse(rawMessage.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
          ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
      });
      
      ws.on("close", () => {
        console.log("WebSocket connection closed");
        this.clients.delete(ws);
      });
      
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: "connection_established",
        data: { message: "Connected to Tessian real-time feed" },
        timestamp: new Date(),
      }));
    });
  }
  
  private handleClientMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case "authenticate":
        this.authenticateClient(ws, message.data);
        break;
      case "subscribe":
        this.subscribeToChannel(ws, message.data.channel);
        break;
      case "unsubscribe":
        this.unsubscribeFromChannel(ws, message.data.channel);
        break;
      case "ping":
        ws.send(JSON.stringify({ type: "pong", timestamp: new Date() }));
        break;
      default:
        ws.send(JSON.stringify({ error: `Unknown message type: ${message.type}` }));
    }
  }
  
  private authenticateClient(ws: WebSocket, authData: any) {
    // In production, validate JWT token or session
    const { tenantId = "default", userId = 1 } = authData;
    
    const clientConnection: ClientConnection = {
      ws,
      tenantId,
      userId,
      subscriptions: [],
    };
    
    this.clients.set(ws, clientConnection);
    
    ws.send(JSON.stringify({
      type: "authenticated",
      data: { tenantId, userId },
      timestamp: new Date(),
    }));
    
    // Auto-subscribe to relevant channels
    this.subscribeToChannel(ws, "threat_events");
    this.subscribeToChannel(ws, "system_alerts");
  }
  
  private subscribeToChannel(ws: WebSocket, channel: string) {
    const client = this.clients.get(ws);
    if (!client) {
      ws.send(JSON.stringify({ error: "Client not authenticated" }));
      return;
    }
    
    if (!client.subscriptions.includes(channel)) {
      client.subscriptions.push(channel);
    }
    
    ws.send(JSON.stringify({
      type: "subscribed",
      data: { channel },
      timestamp: new Date(),
    }));
  }
  
  private unsubscribeFromChannel(ws: WebSocket, channel: string) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    client.subscriptions = client.subscriptions.filter(sub => sub !== channel);
    
    ws.send(JSON.stringify({
      type: "unsubscribed",
      data: { channel },
      timestamp: new Date(),
    }));
  }
  
  broadcast(tenantId: string, message: WebSocketMessage, channel = "general") {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date(),
    };
    
    const messageString = JSON.stringify(messageWithTimestamp);
    
    this.clients.forEach((client, ws) => {
      if (client.tenantId === tenantId && 
          client.subscriptions.includes(channel) &&
          ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageString);
        } catch (error) {
          console.error("Failed to send message to client:", error);
          this.clients.delete(ws);
        }
      }
    });
  }
  
  sendToUser(tenantId: string, userId: number, message: WebSocketMessage) {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date(),
    };
    
    const messageString = JSON.stringify(messageWithTimestamp);
    
    this.clients.forEach((client, ws) => {
      if (client.tenantId === tenantId && 
          client.userId === userId &&
          ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageString);
        } catch (error) {
          console.error("Failed to send message to user:", error);
          this.clients.delete(ws);
        }
      }
    });
  }
  
  getConnectedClients(tenantId?: string): ClientConnection[] {
    const allClients = Array.from(this.clients.values());
    return tenantId 
      ? allClients.filter(client => client.tenantId === tenantId)
      : allClients;
  }
  
  // Real-time metrics broadcasting
  startMetricsBroadcast() {
    setInterval(async () => {
      // Broadcast system metrics to all connected clients
      const tenants = new Set(Array.from(this.clients.values()).map(c => c.tenantId));
      
      for (const tenantId of tenants) {
        const metrics = {
          timestamp: new Date(),
          apiResponseTime: Math.floor(Math.random() * 50) + 100,
          activeConnections: this.getConnectedClients(tenantId).length,
          systemLoad: Math.random() * 100,
          memoryUsage: Math.random() * 80 + 20,
        };
        
        this.broadcast(tenantId, {
          type: "system_metrics",
          data: metrics,
        }, "system_alerts");
      }
    }, 30000); // Every 30 seconds
  }
}
