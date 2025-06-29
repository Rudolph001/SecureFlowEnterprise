#!/usr/bin/env python3
"""
Tessian SIEM Integration - Splunk Forwarder
Enterprise-grade security event forwarding to Splunk and other SIEM platforms
"""

import json
import time
import logging
import asyncio
import aiohttp
import socket
import ssl
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import os
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SeverityLevel(Enum):
    """Security event severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class EventType(Enum):
    """Types of security events"""
    THREAT_DETECTED = "threat_detected"
    POLICY_VIOLATION = "policy_violation"
    DATA_EXFILTRATION = "data_exfiltration"
    PHISHING_ATTEMPT = "phishing_attempt"
    IMPERSONATION = "impersonation"
    BEHAVIORAL_ANOMALY = "behavioral_anomaly"
    USER_TRAINING = "user_training"
    SYSTEM_ALERT = "system_alert"

@dataclass
class SecurityEvent:
    """Represents a security event to be forwarded to SIEM"""
    event_id: str
    timestamp: str
    event_type: EventType
    severity: SeverityLevel
    source_module: str
    user_email: str
    recipient_emails: List[str]
    risk_score: float
    message: str
    indicators: List[str]
    action_taken: str
    metadata: Dict[str, Any]
    tenant_id: Optional[str] = None
    message_id: Optional[str] = None
    
    def to_splunk_format(self) -> Dict[str, Any]:
        """Convert event to Splunk-compatible format"""
        return {
            "time": self.timestamp,
            "event": {
                "tessian_event_id": self.event_id,
                "event_type": self.event_type.value,
                "severity": self.severity.value,
                "source_module": self.source_module,
                "user_email": self.user_email,
                "recipient_emails": self.recipient_emails,
                "risk_score": self.risk_score,
                "message": self.message,
                "indicators": self.indicators,
                "action_taken": self.action_taken,
                "tenant_id": self.tenant_id,
                "message_id": self.message_id,
                "metadata": self.metadata
            },
            "source": "tessian_email_security",
            "sourcetype": "tessian:security_event",
            "index": "security"
        }
    
    def to_cef_format(self) -> str:
        """Convert event to Common Event Format (CEF) for SIEM compatibility"""
        # CEF Header
        device_vendor = "Tessian"
        device_product = "Email Security Platform"
        device_version = "1.0"
        device_event_class_id = self.event_type.value
        name = self.message
        severity_map = {"low": 1, "medium": 5, "high": 8, "critical": 10}
        severity = severity_map.get(self.severity.value, 5)
        
        # CEF Extension
        extensions = [
            f"src={socket.gethostname()}",
            f"suser={self.user_email}",
            f"duser={','.join(self.recipient_emails)}",
            f"cs1Label=RiskScore",
            f"cs1={self.risk_score}",
            f"cs2Label=Module",
            f"cs2={self.source_module}",
            f"cs3Label=ActionTaken",
            f"cs3={self.action_taken}",
            f"cs4Label=Indicators",
            f"cs4={';'.join(self.indicators)}",
            f"deviceCustomDate1Label=EventTime",
            f"deviceCustomDate1={self.timestamp}"
        ]
        
        if self.tenant_id:
            extensions.append(f"cs5Label=TenantId")
            extensions.append(f"cs5={self.tenant_id}")
        
        if self.message_id:
            extensions.append(f"cs6Label=MessageId")
            extensions.append(f"cs6={self.message_id}")
        
        extension_string = " ".join(extensions)
        
        return f"CEF:0|{device_vendor}|{device_product}|{device_version}|{device_event_class_id}|{name}|{severity}|{extension_string}"

class SplunkForwarder:
    """Forwards security events to Splunk via HTTP Event Collector (HEC)"""
    
    def __init__(self, splunk_url: str, hec_token: str, index: str = "security", 
                 source: str = "tessian_email_security", verify_ssl: bool = True):
        self.splunk_url = splunk_url.rstrip('/')
        self.hec_token = hec_token
        self.index = index
        self.source = source
        self.verify_ssl = verify_ssl
        self.session = None
        
        # HEC endpoint
        self.hec_url = urljoin(self.splunk_url, "/services/collector/event")
        
        # Headers for HEC
        self.headers = {
            "Authorization": f"Splunk {self.hec_token}",
            "Content-Type": "application/json"
        }
    
    async def __aenter__(self):
        """Async context manager entry"""
        connector = aiohttp.TCPConnector(ssl=self.verify_ssl)
        self.session = aiohttp.ClientSession(
            connector=connector,
            headers=self.headers,
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def forward_event(self, event: SecurityEvent) -> bool:
        """Forward a single event to Splunk"""
        try:
            splunk_event = event.to_splunk_format()
            splunk_event["index"] = self.index
            splunk_event["source"] = self.source
            
            async with self.session.post(self.hec_url, json=splunk_event) as response:
                if response.status == 200:
                    logger.info(f"Successfully forwarded event {event.event_id} to Splunk")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to forward event {event.event_id} to Splunk: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Exception forwarding event {event.event_id} to Splunk: {str(e)}")
            return False
    
    async def forward_events_batch(self, events: List[SecurityEvent]) -> Dict[str, int]:
        """Forward multiple events in a batch"""
        results = {"success": 0, "failed": 0}
        
        # Prepare batch payload
        batch_events = []
        for event in events:
            splunk_event = event.to_splunk_format()
            splunk_event["index"] = self.index
            splunk_event["source"] = self.source
            batch_events.append(splunk_event)
        
        try:
            # Send batch to Splunk
            batch_payload = "\n".join([json.dumps(event) for event in batch_events])
            
            async with self.session.post(
                self.hec_url, 
                data=batch_payload,
                headers={**self.headers, "Content-Type": "text/plain"}
            ) as response:
                if response.status == 200:
                    results["success"] = len(events)
                    logger.info(f"Successfully forwarded {len(events)} events to Splunk")
                else:
                    results["failed"] = len(events)
                    error_text = await response.text()
                    logger.error(f"Failed to forward batch to Splunk: {response.status} - {error_text}")
                    
        except Exception as e:
            results["failed"] = len(events)
            logger.error(f"Exception forwarding batch to Splunk: {str(e)}")
        
        return results

class SyslogForwarder:
    """Forwards security events via Syslog (TCP/UDP)"""
    
    def __init__(self, syslog_host: str, syslog_port: int = 514, protocol: str = "tcp"):
        self.host = syslog_host
        self.port = syslog_port
        self.protocol = protocol.lower()
        
        if self.protocol not in ["tcp", "udp"]:
            raise ValueError("Protocol must be 'tcp' or 'udp'")
    
    async def forward_event(self, event: SecurityEvent) -> bool:
        """Forward event via syslog"""
        try:
            # Convert to CEF format
            cef_message = event.to_cef_format()
            
            # Add syslog header (RFC 3164)
            timestamp = datetime.now().strftime("%b %d %H:%M:%S")
            hostname = socket.gethostname()
            tag = "tessian"
            
            syslog_message = f"<134>{timestamp} {hostname} {tag}: {cef_message}\n"
            
            if self.protocol == "tcp":
                return await self._send_tcp(syslog_message)
            else:
                return await self._send_udp(syslog_message)
                
        except Exception as e:
            logger.error(f"Exception forwarding event {event.event_id} via syslog: {str(e)}")
            return False
    
    async def _send_tcp(self, message: str) -> bool:
        """Send message via TCP"""
        try:
            reader, writer = await asyncio.open_connection(self.host, self.port)
            writer.write(message.encode('utf-8'))
            await writer.drain()
            writer.close()
            await writer.wait_closed()
            logger.info(f"Successfully sent syslog message via TCP to {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to send syslog message via TCP: {str(e)}")
            return False
    
    async def _send_udp(self, message: str) -> bool:
        """Send message via UDP"""
        try:
            loop = asyncio.get_event_loop()
            transport, protocol = await loop.create_datagram_endpoint(
                lambda: asyncio.DatagramProtocol(),
                remote_addr=(self.host, self.port)
            )
            transport.sendto(message.encode('utf-8'))
            transport.close()
            logger.info(f"Successfully sent syslog message via UDP to {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to send syslog message via UDP: {str(e)}")
            return False

class GenericSIEMForwarder:
    """Generic SIEM forwarder for custom endpoints"""
    
    def __init__(self, endpoint_url: str, auth_token: str = None, auth_header: str = "Authorization"):
        self.endpoint_url = endpoint_url
        self.auth_token = auth_token
        self.auth_header = auth_header
        self.session = None
        
        self.headers = {"Content-Type": "application/json"}
        if self.auth_token:
            self.headers[self.auth_header] = f"Bearer {self.auth_token}"
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            headers=self.headers,
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def forward_event(self, event: SecurityEvent) -> bool:
        """Forward event to generic SIEM endpoint"""
        try:
            # Convert event to JSON format
            event_data = asdict(event)
            event_data['event_type'] = event.event_type.value
            event_data['severity'] = event.severity.value
            
            async with self.session.post(self.endpoint_url, json=event_data) as response:
                if 200 <= response.status < 300:
                    logger.info(f"Successfully forwarded event {event.event_id} to SIEM")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to forward event {event.event_id} to SIEM: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Exception forwarding event {event.event_id} to SIEM: {str(e)}")
            return False

class SIEMIntegrationManager:
    """Manages multiple SIEM integrations and event forwarding"""
    
    def __init__(self):
        self.forwarders = []
        self.event_queue = asyncio.Queue()
        self.is_running = False
        self.batch_size = int(os.getenv('TESSIAN_SIEM_BATCH_SIZE', '10'))
        self.batch_timeout = int(os.getenv('TESSIAN_SIEM_BATCH_TIMEOUT', '30'))
    
    def add_splunk_forwarder(self, splunk_url: str, hec_token: str, **kwargs):
        """Add Splunk HEC forwarder"""
        forwarder = SplunkForwarder(splunk_url, hec_token, **kwargs)
        self.forwarders.append(("splunk", forwarder))
        logger.info(f"Added Splunk forwarder: {splunk_url}")
    
    def add_syslog_forwarder(self, syslog_host: str, syslog_port: int = 514, protocol: str = "tcp"):
        """Add Syslog forwarder"""
        forwarder = SyslogForwarder(syslog_host, syslog_port, protocol)
        self.forwarders.append(("syslog", forwarder))
        logger.info(f"Added Syslog forwarder: {syslog_host}:{syslog_port} ({protocol})")
    
    def add_generic_forwarder(self, endpoint_url: str, auth_token: str = None, **kwargs):
        """Add generic SIEM forwarder"""
        forwarder = GenericSIEMForwarder(endpoint_url, auth_token, **kwargs)
        self.forwarders.append(("generic", forwarder))
        logger.info(f"Added generic SIEM forwarder: {endpoint_url}")
    
    async def queue_event(self, event: SecurityEvent):
        """Queue an event for forwarding"""
        await self.event_queue.put(event)
        logger.debug(f"Queued event {event.event_id} for SIEM forwarding")
    
    async def start_forwarding(self):
        """Start the event forwarding service"""
        self.is_running = True
        logger.info("Starting SIEM event forwarding service")
        
        while self.is_running:
            try:
                # Collect events for batch processing
                events = []
                deadline = time.time() + self.batch_timeout
                
                while len(events) < self.batch_size and time.time() < deadline:
                    try:
                        # Wait for event with timeout
                        remaining_time = deadline - time.time()
                        if remaining_time <= 0:
                            break
                            
                        event = await asyncio.wait_for(
                            self.event_queue.get(), 
                            timeout=remaining_time
                        )
                        events.append(event)
                        
                    except asyncio.TimeoutError:
                        break
                
                # Forward events if any
                if events:
                    await self._forward_events(events)
                    
            except Exception as e:
                logger.error(f"Error in forwarding loop: {str(e)}")
                await asyncio.sleep(5)  # Brief pause before retrying
    
    async def _forward_events(self, events: List[SecurityEvent]):
        """Forward events to all configured SIEM systems"""
        tasks = []
        
        for forwarder_type, forwarder in self.forwarders:
            if forwarder_type == "splunk":
                # Use batch forwarding for Splunk
                task = self._forward_to_splunk_batch(forwarder, events)
            else:
                # Use individual forwarding for others
                task = self._forward_to_forwarder(forwarder, events)
            
            tasks.append(task)
        
        # Execute all forwarding tasks concurrently
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Log results
            for i, result in enumerate(results):
                forwarder_type = self.forwarders[i][0]
                if isinstance(result, Exception):
                    logger.error(f"Exception in {forwarder_type} forwarder: {str(result)}")
                else:
                    logger.debug(f"Forwarded {len(events)} events to {forwarder_type}")
    
    async def _forward_to_splunk_batch(self, forwarder: SplunkForwarder, events: List[SecurityEvent]):
        """Forward events to Splunk using batch API"""
        async with forwarder:
            return await forwarder.forward_events_batch(events)
    
    async def _forward_to_forwarder(self, forwarder, events: List[SecurityEvent]):
        """Forward events to non-Splunk forwarders"""
        results = {"success": 0, "failed": 0}
        
        if hasattr(forwarder, '__aenter__'):
            # Async context manager (GenericSIEMForwarder)
            async with forwarder:
                for event in events:
                    success = await forwarder.forward_event(event)
                    if success:
                        results["success"] += 1
                    else:
                        results["failed"] += 1
        else:
            # Direct async methods (SyslogForwarder)
            for event in events:
                success = await forwarder.forward_event(event)
                if success:
                    results["success"] += 1
                else:
                    results["failed"] += 1
        
        return results
    
    def stop_forwarding(self):
        """Stop the event forwarding service"""
        self.is_running = False
        logger.info("Stopping SIEM event forwarding service")

# Event creation utilities
def create_threat_event(user_email: str, recipients: List[str], threat_type: str, 
                       risk_score: float, message: str, indicators: List[str],
                       action_taken: str, source_module: str, **metadata) -> SecurityEvent:
    """Create a threat detection event"""
    return SecurityEvent(
        event_id=f"threat_{int(time.time())}_{hash(user_email)}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        event_type=EventType.THREAT_DETECTED,
        severity=_determine_severity(risk_score),
        source_module=source_module,
        user_email=user_email,
        recipient_emails=recipients,
        risk_score=risk_score,
        message=message,
        indicators=indicators,
        action_taken=action_taken,
        metadata=metadata
    )

def create_policy_violation_event(user_email: str, recipients: List[str], 
                                 policy_name: str, violation_details: str,
                                 action_taken: str, **metadata) -> SecurityEvent:
    """Create a policy violation event"""
    return SecurityEvent(
        event_id=f"policy_{int(time.time())}_{hash(user_email)}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        event_type=EventType.POLICY_VIOLATION,
        severity=SeverityLevel.MEDIUM,
        source_module="Policy Engine",
        user_email=user_email,
        recipient_emails=recipients,
        risk_score=0.7,
        message=f"Policy violation: {policy_name}",
        indicators=[violation_details],
        action_taken=action_taken,
        metadata={"policy_name": policy_name, **metadata}
    )

def _determine_severity(risk_score: float) -> SeverityLevel:
    """Determine severity level based on risk score"""
    if risk_score >= 0.8:
        return SeverityLevel.CRITICAL
    elif risk_score >= 0.6:
        return SeverityLevel.HIGH
    elif risk_score >= 0.3:
        return SeverityLevel.MEDIUM
    else:
        return SeverityLevel.LOW

# Configuration loading
def load_config_from_env() -> Dict[str, Any]:
    """Load SIEM configuration from environment variables"""
    config = {}
    
    # Splunk configuration
    if os.getenv('SPLUNK_URL') and os.getenv('SPLUNK_HEC_TOKEN'):
        config['splunk'] = {
            'url': os.getenv('SPLUNK_URL'),
            'hec_token': os.getenv('SPLUNK_HEC_TOKEN'),
            'index': os.getenv('SPLUNK_INDEX', 'security'),
            'verify_ssl': os.getenv('SPLUNK_VERIFY_SSL', 'true').lower() == 'true'
        }
    
    # Syslog configuration
    if os.getenv('SYSLOG_HOST'):
        config['syslog'] = {
            'host': os.getenv('SYSLOG_HOST'),
            'port': int(os.getenv('SYSLOG_PORT', '514')),
            'protocol': os.getenv('SYSLOG_PROTOCOL', 'tcp')
        }
    
    # Generic SIEM configuration
    if os.getenv('SIEM_ENDPOINT_URL'):
        config['generic'] = {
            'endpoint_url': os.getenv('SIEM_ENDPOINT_URL'),
            'auth_token': os.getenv('SIEM_AUTH_TOKEN'),
            'auth_header': os.getenv('SIEM_AUTH_HEADER', 'Authorization')
        }
    
    return config

# Main execution
async def main():
    """Main function for testing the SIEM forwarder"""
    # Load configuration
    config = load_config_from_env()
    
    if not config:
        logger.warning("No SIEM configuration found in environment variables")
        return
    
    # Create SIEM manager
    siem_manager = SIEMIntegrationManager()
    
    # Add forwarders based on configuration
    if 'splunk' in config:
        siem_manager.add_splunk_forwarder(**config['splunk'])
    
    if 'syslog' in config:
        siem_manager.add_syslog_forwarder(**config['syslog'])
    
    if 'generic' in config:
        siem_manager.add_generic_forwarder(**config['generic'])
    
    # Create test event
    test_event = create_threat_event(
        user_email="test.user@company.com",
        recipients=["external@example.com"],
        threat_type="phishing",
        risk_score=0.85,
        message="Phishing attempt detected and blocked",
        indicators=["suspicious_domain", "credential_request"],
        action_taken="blocked",
        source_module="Defender",
        message_id="test_123",
        tenant_id="acme_corp"
    )
    
    # Queue and forward test event
    await siem_manager.queue_event(test_event)
    
    # Start forwarding (run for a short time for testing)
    forwarding_task = asyncio.create_task(siem_manager.start_forwarding())
    
    # Let it run for a few seconds
    await asyncio.sleep(5)
    
    # Stop forwarding
    siem_manager.stop_forwarding()
    forwarding_task.cancel()
    
    logger.info("SIEM forwarding test completed")

if __name__ == "__main__":
    asyncio.run(main())
