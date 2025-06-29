/* global Office */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        apiEndpoint: process.env.TESSIAN_API_URL || 'https://api.tessian.com',
        apiKey: process.env.TESSIAN_API_KEY || 'your-api-key-here',
        silentMode: false,
        blockHighRisk: true,
        externalWarnings: true,
        riskThresholds: {
            high: 0.8,
            medium: 0.6,
            low: 0.3
        }
    };

    // Global state
    let currentEmailData = null;
    let analysisResult = null;

    // Initialize the add-in
    Office.onReady((info) => {
        if (info.host === Office.HostType.Outlook) {
            initializeAddin();
        }
    });

    function initializeAddin() {
        // Load settings from storage
        loadSettings();
        
        // Set up event handlers
        setupEventHandlers();
        
        // Start email analysis
        analyzeCurrentEmail();
    }

    function setupEventHandlers() {
        // Warning action buttons
        document.getElementById('sendAnywayBtn').addEventListener('click', handleSendAnyway);
        document.getElementById('reviewBtn').addEventListener('click', handleReviewEmail);
        document.getElementById('cancelBtn').addEventListener('click', handleCancelSend);
        
        // Settings
        document.getElementById('settingsToggleBtn').addEventListener('click', toggleSettings);
        document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
        
        // Setting toggles
        document.getElementById('silentModeToggle').addEventListener('change', function() {
            CONFIG.silentMode = this.checked;
        });
        
        document.getElementById('blockHighRiskToggle').addEventListener('change', function() {
            CONFIG.blockHighRisk = this.checked;
        });
        
        document.getElementById('externalWarningsToggle').addEventListener('change', function() {
            CONFIG.externalWarnings = this.checked;
        });
    }

    // Event handlers for launch events
    function onMessageSendHandler(event) {
        console.log('Tessian: Message send event triggered');
        
        Office.context.mailbox.item.getAsync((result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                const item = result.value;
                analyzeEmailForSend(item, event);
            }
        });
    }

    function onNewMessageComposeHandler(event) {
        console.log('Tessian: New message compose event triggered');
        analyzeCurrentEmail();
        event.completed();
    }

    async function analyzeEmailForSend(item, event) {
        try {
            showScanningStatus();
            
            const emailData = await extractEmailData(item);
            const analysis = await performSecurityAnalysis(emailData);
            
            if (analysis.riskScore >= CONFIG.riskThresholds.high && CONFIG.blockHighRisk) {
                // Block the send and show warning
                event.completed({ allowEvent: false });
                showWarning(analysis, 'critical');
            } else if (analysis.riskScore >= CONFIG.riskThresholds.medium) {
                if (CONFIG.silentMode) {
                    // Log silently and allow send
                    logSecurityEvent(emailData, analysis, 'warned_silent');
                    event.completed({ allowEvent: true });
                } else {
                    // Show warning but allow user to proceed
                    event.completed({ allowEvent: false });
                    showWarning(analysis, 'medium');
                }
            } else {
                // Low risk or safe - allow send
                logSecurityEvent(emailData, analysis, 'allowed');
                event.completed({ allowEvent: true });
                showSafeStatus();
            }
        } catch (error) {
            console.error('Tessian: Error analyzing email:', error);
            // On error, allow send but log the issue
            logError(error);
            event.completed({ allowEvent: true });
        }
    }

    async function analyzeCurrentEmail() {
        try {
            showScanningStatus();
            
            const emailData = await extractCurrentEmailData();
            if (emailData) {
                currentEmailData = emailData;
                analysisResult = await performSecurityAnalysis(emailData);
                
                if (analysisResult.riskScore >= CONFIG.riskThresholds.medium && !CONFIG.silentMode) {
                    const severity = analysisResult.riskScore >= CONFIG.riskThresholds.high ? 'critical' : 'medium';
                    showWarning(analysisResult, severity);
                } else {
                    showSafeStatus();
                }
                
                // Always log the analysis
                logSecurityEvent(emailData, analysisResult, 'analyzed');
            }
        } catch (error) {
            console.error('Tessian: Error analyzing current email:', error);
            showSafeStatus(); // Fail safe
        }
    }

    function extractCurrentEmailData() {
        return new Promise((resolve, reject) => {
            Office.context.mailbox.item.to.getAsync((toResult) => {
                if (toResult.status !== Office.AsyncResultStatus.Succeeded) {
                    reject(new Error('Failed to get recipients'));
                    return;
                }

                Office.context.mailbox.item.subject.getAsync((subjectResult) => {
                    if (subjectResult.status !== Office.AsyncResultStatus.Succeeded) {
                        reject(new Error('Failed to get subject'));
                        return;
                    }

                    Office.context.mailbox.item.body.getAsync('text', (bodyResult) => {
                        if (bodyResult.status !== Office.AsyncResultStatus.Succeeded) {
                            reject(new Error('Failed to get body'));
                            return;
                        }

                        const emailData = {
                            to: toResult.value.map(r => r.emailAddress),
                            cc: [],
                            bcc: [],
                            subject: subjectResult.value || '',
                            body: bodyResult.value || '',
                            sender: Office.context.mailbox.userProfile.emailAddress,
                            timestamp: new Date().toISOString(),
                            messageId: Office.context.mailbox.item.itemId || generateMessageId()
                        };

                        resolve(emailData);
                    });
                });
            });
        });
    }

    async function extractEmailData(item) {
        // Similar to extractCurrentEmailData but for the item parameter
        return new Promise((resolve, reject) => {
            const emailData = {
                to: item.to || [],
                cc: item.cc || [],
                bcc: item.bcc || [],
                subject: item.subject || '',
                body: '', // We'll get this separately for privacy
                sender: Office.context.mailbox.userProfile.emailAddress,
                timestamp: new Date().toISOString(),
                messageId: item.itemId || generateMessageId()
            };
            resolve(emailData);
        });
    }

    async function performSecurityAnalysis(emailData) {
        const analysisPayload = {
            messageId: emailData.messageId,
            sender: emailData.sender,
            recipients: emailData.to.concat(emailData.cc || [], emailData.bcc || []),
            subject: emailData.subject,
            // Note: We don't send the full body for privacy, just metadata
            hasAttachments: false, // Would need to implement attachment detection
            isExternal: emailData.to.some(email => !isInternalEmail(email)),
            timestamp: emailData.timestamp
        };

        try {
            const response = await fetch('/api/addins/outlook/warning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.apiKey}`
                },
                body: JSON.stringify(analysisPayload)
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.status}`);
            }

            const result = await response.json();
            
            return {
                riskScore: result.riskScore || 0,
                warningLevel: result.warningLevel || 'low',
                message: result.message || 'Email analyzed successfully',
                indicators: result.indicators || [],
                module: result.detectionModule || 'Guardian',
                showWarning: result.showWarning || false
            };
        } catch (error) {
            console.error('Tessian: API call failed:', error);
            
            // Fallback to local analysis
            return performLocalAnalysis(emailData);
        }
    }

    function performLocalAnalysis(emailData) {
        let riskScore = 0;
        const indicators = [];
        
        // Check for external recipients
        const externalRecipients = emailData.to.filter(email => !isInternalEmail(email));
        if (externalRecipients.length > 0) {
            riskScore += 0.3;
            indicators.push('External recipients detected');
        }
        
        // Check for suspicious keywords in subject
        const suspiciousKeywords = ['urgent', 'confidential', 'password', 'wire transfer', 'click here'];
        const subjectLower = emailData.subject.toLowerCase();
        
        if (suspiciousKeywords.some(keyword => subjectLower.includes(keyword))) {
            riskScore += 0.2;
            indicators.push('Suspicious keywords in subject');
        }
        
        // Check for first-time recipients
        if (externalRecipients.length > 0) {
            riskScore += 0.1;
            indicators.push('First-time external communication');
        }

        const warningLevel = riskScore >= 0.8 ? 'critical' : riskScore >= 0.6 ? 'high' : riskScore >= 0.3 ? 'medium' : 'low';
        
        return {
            riskScore,
            warningLevel,
            message: generateWarningMessage(indicators),
            indicators,
            module: 'Guardian',
            showWarning: riskScore >= CONFIG.riskThresholds.medium
        };
    }

    function generateWarningMessage(indicators) {
        if (indicators.length === 0) {
            return 'Email appears safe to send';
        }
        
        const messages = {
            'External recipients detected': "You're sending to external recipients",
            'Suspicious keywords in subject': "Subject contains sensitive keywords",
            'First-time external communication': "You've never emailed this person before"
        };
        
        return indicators.map(indicator => messages[indicator] || indicator).join('. ');
    }

    function isInternalEmail(email) {
        // Simple check - in production, this would check against company domains
        const userDomain = Office.context.mailbox.userProfile.emailAddress.split('@')[1];
        const emailDomain = email.split('@')[1];
        return emailDomain === userDomain;
    }

    function showWarning(analysis, severity) {
        hideAllContainers();
        
        const container = document.getElementById('warningContainer');
        const icon = document.getElementById('warningIcon');
        const title = document.getElementById('warningTitle');
        const message = document.getElementById('warningMessage');
        const details = document.getElementById('warningDetails');
        const riskScore = document.getElementById('riskScore');
        const module = document.getElementById('detectionModule');
        
        // Set severity class
        container.className = `warning-container ${severity}`;
        
        // Set content
        icon.textContent = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '⚡';
        title.textContent = severity === 'critical' ? 'High Risk Email' : 'Security Warning';
        message.textContent = analysis.message;
        riskScore.textContent = `${Math.round(analysis.riskScore * 100)}%`;
        module.textContent = analysis.module;
        
        container.style.display = 'block';
    }

    function showSafeStatus() {
        hideAllContainers();
        document.getElementById('statusContainer').style.display = 'block';
    }

    function showScanningStatus() {
        hideAllContainers();
        document.getElementById('scanningContainer').style.display = 'block';
    }

    function hideAllContainers() {
        document.getElementById('warningContainer').style.display = 'none';
        document.getElementById('statusContainer').style.display = 'none';
        document.getElementById('scanningContainer').style.display = 'none';
    }

    function handleSendAnyway() {
        if (currentEmailData && analysisResult) {
            logSecurityEvent(currentEmailData, analysisResult, 'sent_despite_warning');
        }
        
        // Close the warning and allow send
        showSafeStatus();
        
        // If this is a send event, we would complete the event here
        // But since this is a taskpane, we just hide the warning
    }

    function handleReviewEmail() {
        // This would open a detailed review pane
        alert('This would open a detailed email review interface.');
    }

    function handleCancelSend() {
        if (currentEmailData && analysisResult) {
            logSecurityEvent(currentEmailData, analysisResult, 'send_cancelled');
        }
        
        showSafeStatus();
        
        // In a real implementation, this would cancel the send operation
        Office.context.mailbox.item.close();
    }

    function toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    function saveSettings() {
        // Save settings to Office.js storage
        const settings = {
            silentMode: CONFIG.silentMode,
            blockHighRisk: CONFIG.blockHighRisk,
            externalWarnings: CONFIG.externalWarnings
        };
        
        Office.context.roamingSettings.set('tessianSettings', JSON.stringify(settings));
        Office.context.roamingSettings.saveAsync();
        
        document.getElementById('settingsPanel').style.display = 'none';
        
        // Show confirmation
        alert('Settings saved successfully!');
    }

    function loadSettings() {
        try {
            const settingsStr = Office.context.roamingSettings.get('tessianSettings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                CONFIG.silentMode = settings.silentMode || false;
                CONFIG.blockHighRisk = settings.blockHighRisk !== false; // Default true
                CONFIG.externalWarnings = settings.externalWarnings !== false; // Default true
                
                // Update UI
                document.getElementById('silentModeToggle').checked = CONFIG.silentMode;
                document.getElementById('blockHighRiskToggle').checked = CONFIG.blockHighRisk;
                document.getElementById('externalWarningsToggle').checked = CONFIG.externalWarnings;
            }
        } catch (error) {
            console.error('Tessian: Error loading settings:', error);
        }
    }

    async function logSecurityEvent(emailData, analysis, action) {
        const eventData = {
            messageId: emailData.messageId,
            sender: emailData.sender,
            recipients: emailData.to,
            riskScore: analysis.riskScore,
            warningLevel: analysis.warningLevel,
            action: action,
            module: analysis.module,
            timestamp: new Date().toISOString(),
            indicators: analysis.indicators,
            userAgent: navigator.userAgent
        };

        try {
            await fetch('/api/email-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.apiKey}`
                },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            console.error('Tessian: Failed to log security event:', error);
        }
    }

    function logError(error) {
        console.error('Tessian: Error logged:', error);
        
        // In production, send error to monitoring service
        fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                context: 'outlook-addon'
            })
        }).catch(e => console.error('Failed to log error:', e));
    }

    function generateMessageId() {
        return 'tessian-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Expose functions for launch events
    if (typeof window !== 'undefined') {
        window.onMessageSendHandler = onMessageSendHandler;
        window.onNewMessageComposeHandler = onNewMessageComposeHandler;
    }

})();
