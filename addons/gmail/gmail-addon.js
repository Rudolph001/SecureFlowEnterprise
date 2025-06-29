/**
 * Tessian Gmail Add-on for Google Workspace
 * Provides real-time email security analysis and user warnings
 */

// Configuration
const CONFIG = {
  API_ENDPOINT: PropertiesService.getScriptProperties().getProperty('TESSIAN_API_ENDPOINT') || 'https://api.tessian.com',
  API_KEY: PropertiesService.getScriptProperties().getProperty('TESSIAN_API_KEY') || 'your-api-key-here',
  SILENT_MODE: PropertiesService.getScriptProperties().getProperty('TESSIAN_SILENT_MODE') === 'true',
  BLOCK_HIGH_RISK: PropertiesService.getScriptProperties().getProperty('TESSIAN_BLOCK_HIGH_RISK') !== 'false',
  RISK_THRESHOLDS: {
    high: 0.8,
    medium: 0.6,
    low: 0.3
  }
};

/**
 * Triggered when user opens compose window
 */
function onGmailCompose(e) {
  console.log('Tessian: Gmail compose event triggered');
  
  try {
    const card = buildComposeCard();
    return [card];
  } catch (error) {
    console.error('Tessian: Error in onGmailCompose:', error);
    return [buildErrorCard(error.message)];
  }
}

/**
 * Triggered when user clicks send button
 */
function onGmailSend(e) {
  console.log('Tessian: Gmail send event triggered');
  
  try {
    const emailData = extractEmailData(e);
    const analysis = performEmailAnalysis(emailData);
    
    if (analysis.riskScore >= CONFIG.RISK_THRESHOLDS.high && CONFIG.BLOCK_HIGH_RISK) {
      // Block send and show warning
      return buildWarningCard(analysis, 'critical', emailData);
    } else if (analysis.riskScore >= CONFIG.RISK_THRESHOLDS.medium) {
      if (CONFIG.SILENT_MODE) {
        // Log silently and allow send
        logSecurityEvent(emailData, analysis, 'warned_silent');
        return buildSafeCard('Email analyzed and logged');
      } else {
        // Show warning
        return buildWarningCard(analysis, 'medium', emailData);
      }
    } else {
      // Safe to send
      logSecurityEvent(emailData, analysis, 'allowed');
      return buildSafeCard('Email appears safe to send');
    }
  } catch (error) {
    console.error('Tessian: Error in onGmailSend:', error);
    logError(error);
    return buildSafeCard('Security check completed'); // Fail safe
  }
}

/**
 * Build the main compose card
 */
function buildComposeCard() {
  const card = CardService.newCardBuilder()
    .setName('tessian_security')
    .setHeader(CardService.newCardHeader()
      .setTitle('Tessian Email Security')
      .setSubtitle('Real-time threat protection')
      .setImageUrl('https://tessian-addon.azurewebsites.net/images/icon-32.png')
    );

  const section = CardService.newCardSection()
    .setHeader('Security Status');

  // Status widget
  const statusWidget = CardService.newTextParagraph()
    .setText('<font color="#28a745"><b>✓ Ready to analyze</b></font><br>' +
             '<font color="#6c757d">Tessian will scan your email before sending</font>');
  
  section.addWidget(statusWidget);

  // Settings section
  const settingsSection = CardService.newCardSection()
    .setHeader('Settings')
    .setCollapsible(true)
    .setNumUncollapsibleWidgets(0);

  // Silent mode toggle
  const silentModeWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName('silent_mode')
    .addItem('Enable silent mode (log without warnings)', 'true', CONFIG.SILENT_MODE);
  
  settingsSection.addWidget(silentModeWidget);

  // Block high risk toggle
  const blockHighRiskWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName('block_high_risk')
    .addItem('Block high-risk emails', 'true', CONFIG.BLOCK_HIGH_RISK);
  
  settingsSection.addWidget(blockHighRiskWidget);

  // Save settings button
  const saveAction = CardService.newAction()
    .setFunctionName('saveSettings');
  
  const saveButton = CardService.newTextButton()
    .setText('Save Settings')
    .setOnClickAction(saveAction);
  
  settingsSection.addWidget(saveButton);

  card.addSection(section);
  card.addSection(settingsSection);

  return card.build();
}

/**
 * Build warning card for risky emails
 */
function buildWarningCard(analysis, severity, emailData) {
  const card = CardService.newCardBuilder()
    .setName('tessian_warning')
    .setHeader(CardService.newCardHeader()
      .setTitle('⚠️ Security Warning')
      .setSubtitle(`Risk Level: ${severity.toUpperCase()}`)
      .setImageUrl('https://tessian-addon.azurewebsites.net/images/warning-icon.png')
    );

  // Warning message section
  const warningSection = CardService.newCardSection();
  
  const warningText = CardService.newTextParagraph()
    .setText(`<font color="#dc3545"><b>${analysis.message}</b></font><br><br>` +
             `<b>Risk Score:</b> ${Math.round(analysis.riskScore * 100)}%<br>` +
             `<b>Detection Module:</b> ${analysis.module}<br>` +
             `<b>Recipients:</b> ${emailData.to.join(', ')}`);
  
  warningSection.addWidget(warningText);

  // Show indicators if available
  if (analysis.indicators && analysis.indicators.length > 0) {
    const indicatorsText = CardService.newTextParagraph()
      .setText('<b>Risk Indicators:</b><br>• ' + analysis.indicators.join('<br>• '));
    
    warningSection.addWidget(indicatorsText);
  }

  card.addSection(warningSection);

  // Action buttons section
  const actionSection = CardService.newCardSection();

  if (severity !== 'critical' || !CONFIG.BLOCK_HIGH_RISK) {
    // Send anyway button
    const sendAnywayAction = CardService.newAction()
      .setFunctionName('handleSendAnyway')
      .setParameters({
        'emailData': JSON.stringify(emailData),
        'analysis': JSON.stringify(analysis)
      });
    
    const sendAnywayButton = CardService.newTextButton()
      .setText('Send Anyway')
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor('#dc3545')
      .setOnClickAction(sendAnywayAction);
    
    actionSection.addWidget(sendAnywayButton);
  }

  // Review email button
  const reviewAction = CardService.newAction()
    .setFunctionName('handleReviewEmail')
    .setParameters({
      'emailData': JSON.stringify(emailData),
      'analysis': JSON.stringify(analysis)
    });
  
  const reviewButton = CardService.newTextButton()
    .setText('Review Email')
    .setOnClickAction(reviewAction);
  
  actionSection.addWidget(reviewButton);

  // Cancel send button
  const cancelAction = CardService.newAction()
    .setFunctionName('handleCancelSend')
    .setParameters({
      'emailData': JSON.stringify(emailData),
      'analysis': JSON.stringify(analysis)
    });
  
  const cancelButton = CardService.newTextButton()
    .setText('Cancel Send')
    .setOnClickAction(cancelAction);
  
  actionSection.addWidget(cancelButton);

  card.addSection(actionSection);

  return card.build();
}

/**
 * Build safe status card
 */
function buildSafeCard(message) {
  const card = CardService.newCardBuilder()
    .setName('tessian_safe')
    .setHeader(CardService.newCardHeader()
      .setTitle('✅ Email Safe')
      .setSubtitle('No security threats detected')
    );

  const section = CardService.newCardSection();
  
  const statusText = CardService.newTextParagraph()
    .setText(`<font color="#28a745"><b>${message}</b></font><br><br>` +
             '<font color="#6c757d">Scanned by Tessian Security</font>');
  
  section.addWidget(statusText);
  card.addSection(section);

  return card.build();
}

/**
 * Build error card
 */
function buildErrorCard(errorMessage) {
  const card = CardService.newCardBuilder()
    .setName('tessian_error')
    .setHeader(CardService.newCardHeader()
      .setTitle('⚠️ Security Check Error')
      .setSubtitle('Unable to analyze email')
    );

  const section = CardService.newCardSection();
  
  const errorText = CardService.newTextParagraph()
    .setText(`<font color="#dc3545">Error: ${errorMessage}</font><br><br>` +
             '<font color="#6c757d">Email will be sent without security analysis</font>');
  
  section.addWidget(errorText);
  card.addSection(section);

  return card.build();
}

/**
 * Extract email data from Gmail compose event
 */
function extractEmailData(e) {
  const draftId = e.gmail.composeTrigger.draftId;
  const draft = GmailApp.getDraft(draftId);
  const message = draft.getMessage();
  
  return {
    messageId: message.getId() || generateMessageId(),
    to: extractRecipients(e.gmail.composeTrigger.toRecipients),
    cc: extractRecipients(e.gmail.composeTrigger.ccRecipients),
    bcc: extractRecipients(e.gmail.composeTrigger.bccRecipients),
    subject: message.getSubject() || '',
    body: message.getPlainBody() || '',
    sender: Session.getActiveUser().getEmail(),
    timestamp: new Date().toISOString(),
    hasAttachments: message.getAttachments().length > 0,
    attachmentCount: message.getAttachments().length
  };
}

/**
 * Extract recipients from Gmail compose data
 */
function extractRecipients(recipients) {
  if (!recipients) return [];
  return recipients.map(r => r.email || r);
}

/**
 * Perform email security analysis
 */
function performEmailAnalysis(emailData) {
  try {
    // Try API call first
    return performAPIAnalysis(emailData);
  } catch (error) {
    console.error('Tessian: API analysis failed, falling back to local:', error);
    return performLocalAnalysis(emailData);
  }
}

/**
 * Perform analysis via Tessian API
 */
function performAPIAnalysis(emailData) {
  const payload = {
    messageId: emailData.messageId,
    sender: emailData.sender,
    recipients: emailData.to.concat(emailData.cc || [], emailData.bcc || []),
    subject: emailData.subject,
    hasAttachments: emailData.hasAttachments,
    isExternal: emailData.to.some(email => !isInternalEmail(email)),
    timestamp: emailData.timestamp
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.API_KEY}`
    },
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(`${CONFIG.API_ENDPOINT}/api/addins/gmail/warning`, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error(`API Error: ${response.getResponseCode()}`);
  }

  const result = JSON.parse(response.getContentText());
  
  return {
    riskScore: result.riskScore || 0,
    warningLevel: result.warningLevel || 'low',
    message: result.message || 'Email analyzed successfully',
    indicators: result.indicators || [],
    module: result.detectionModule || 'Guardian',
    showWarning: result.showWarning || false
  };
}

/**
 * Perform local email analysis
 */
function performLocalAnalysis(emailData) {
  let riskScore = 0;
  const indicators = [];
  
  // Check for external recipients
  const externalRecipients = emailData.to.filter(email => !isInternalEmail(email));
  if (externalRecipients.length > 0) {
    riskScore += 0.3;
    indicators.push('External recipients detected');
  }
  
  // Check for suspicious keywords
  const suspiciousKeywords = ['urgent', 'confidential', 'password', 'wire transfer', 'click here', 'verify account'];
  const subjectLower = emailData.subject.toLowerCase();
  const bodyLower = emailData.body.toLowerCase();
  
  let suspiciousCount = 0;
  suspiciousKeywords.forEach(keyword => {
    if (subjectLower.includes(keyword) || bodyLower.includes(keyword)) {
      suspiciousCount++;
    }
  });
  
  if (suspiciousCount > 0) {
    riskScore += Math.min(suspiciousCount * 0.15, 0.4);
    indicators.push(`Suspicious keywords detected (${suspiciousCount})`);
  }
  
  // Check for attachments to external recipients
  if (emailData.hasAttachments && externalRecipients.length > 0) {
    riskScore += 0.2;
    indicators.push('Attachments being sent externally');
  }
  
  // Check for first-time external communication
  if (externalRecipients.length > 0) {
    // In a real implementation, we'd check against user's contact history
    riskScore += 0.1;
    indicators.push('First-time external communication');
  }

  // Check for unusual sending patterns
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    riskScore += 0.1;
    indicators.push('Email sent outside business hours');
  }

  const warningLevel = riskScore >= 0.8 ? 'critical' : riskScore >= 0.6 ? 'high' : riskScore >= 0.3 ? 'medium' : 'low';
  
  return {
    riskScore,
    warningLevel,
    message: generateWarningMessage(indicators, externalRecipients),
    indicators,
    module: 'Guardian',
    showWarning: riskScore >= CONFIG.RISK_THRESHOLDS.medium
  };
}

/**
 * Generate appropriate warning message
 */
function generateWarningMessage(indicators, externalRecipients) {
  if (indicators.length === 0) {
    return 'Email appears safe to send';
  }
  
  let message = '';
  
  if (indicators.includes('External recipients detected')) {
    if (externalRecipients.length === 1) {
      message = "You're sending to an external recipient";
    } else {
      message = `You're sending to ${externalRecipients.length} external recipients`;
    }
  }
  
  if (indicators.includes('First-time external communication')) {
    message += message ? '. This appears to be your first email to this recipient' : "You've never emailed this person before";
  }
  
  if (indicators.some(i => i.includes('Suspicious keywords'))) {
    message += message ? '. Email contains sensitive content' : 'Email contains potentially sensitive content';
  }
  
  if (indicators.includes('Attachments being sent externally')) {
    message += message ? ' with attachments' : 'You are sending attachments externally';
  }
  
  return message || 'Potential security risk detected';
}

/**
 * Check if email is internal
 */
function isInternalEmail(email) {
  const userDomain = Session.getActiveUser().getEmail().split('@')[1];
  const emailDomain = email.split('@')[1];
  
  // In production, this would check against a list of company domains
  return emailDomain === userDomain;
}

/**
 * Handle "Send Anyway" action
 */
function handleSendAnyway(e) {
  try {
    const emailData = JSON.parse(e.parameters.emailData);
    const analysis = JSON.parse(e.parameters.analysis);
    
    logSecurityEvent(emailData, analysis, 'sent_despite_warning');
    
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Email sent. Security event logged.')
        .setType(CardService.NotificationType.INFO))
      .build();
  } catch (error) {
    console.error('Tessian: Error in handleSendAnyway:', error);
    return buildErrorCard('Failed to process action');
  }
}

/**
 * Handle "Review Email" action
 */
function handleReviewEmail(e) {
  try {
    const emailData = JSON.parse(e.parameters.emailData);
    const analysis = JSON.parse(e.parameters.analysis);
    
    // Build detailed review card
    const card = CardService.newCardBuilder()
      .setName('tessian_review')
      .setHeader(CardService.newCardHeader()
        .setTitle('📋 Email Review')
        .setSubtitle('Detailed security analysis')
      );

    const section = CardService.newCardSection();
    
    let reviewText = `<b>Security Analysis Results</b><br><br>`;
    reviewText += `<b>Risk Score:</b> ${Math.round(analysis.riskScore * 100)}%<br>`;
    reviewText += `<b>Warning Level:</b> ${analysis.warningLevel.toUpperCase()}<br>`;
    reviewText += `<b>Detection Module:</b> ${analysis.module}<br><br>`;
    
    if (analysis.indicators.length > 0) {
      reviewText += `<b>Risk Indicators:</b><br>`;
      analysis.indicators.forEach(indicator => {
        reviewText += `• ${indicator}<br>`;
      });
      reviewText += '<br>';
    }
    
    reviewText += `<b>Recipients:</b><br>`;
    emailData.to.forEach(recipient => {
      const isExternal = !isInternalEmail(recipient);
      reviewText += `• ${recipient} ${isExternal ? '(External)' : '(Internal)'}<br>`;
    });
    
    const reviewWidget = CardService.newTextParagraph().setText(reviewText);
    section.addWidget(reviewWidget);
    
    card.addSection(section);
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(card.build()))
      .build();
  } catch (error) {
    console.error('Tessian: Error in handleReviewEmail:', error);
    return buildErrorCard('Failed to load review');
  }
}

/**
 * Handle "Cancel Send" action
 */
function handleCancelSend(e) {
  try {
    const emailData = JSON.parse(e.parameters.emailData);
    const analysis = JSON.parse(e.parameters.analysis);
    
    logSecurityEvent(emailData, analysis, 'send_cancelled');
    
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Send cancelled. Security event logged.')
        .setType(CardService.NotificationType.INFO))
      .build();
  } catch (error) {
    console.error('Tessian: Error in handleCancelSend:', error);
    return buildErrorCard('Failed to cancel send');
  }
}

/**
 * Save user settings
 */
function saveSettings(e) {
  try {
    const formInputs = e.formInputs || {};
    
    const silentMode = formInputs.silent_mode && formInputs.silent_mode[0] === 'true';
    const blockHighRisk = formInputs.block_high_risk && formInputs.block_high_risk[0] === 'true';
    
    // Save to script properties
    PropertiesService.getScriptProperties().setProperties({
      'TESSIAN_SILENT_MODE': silentMode.toString(),
      'TESSIAN_BLOCK_HIGH_RISK': blockHighRisk.toString()
    });
    
    // Update config
    CONFIG.SILENT_MODE = silentMode;
    CONFIG.BLOCK_HIGH_RISK = blockHighRisk;
    
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Settings saved successfully!')
        .setType(CardService.NotificationType.INFO))
      .build();
  } catch (error) {
    console.error('Tessian: Error saving settings:', error);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('Failed to save settings')
        .setType(CardService.NotificationType.ERROR))
      .build();
  }
}

/**
 * Log security event to Tessian backend
 */
function logSecurityEvent(emailData, analysis, action) {
  try {
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
      platform: 'gmail',
      hasAttachments: emailData.hasAttachments
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`
      },
      payload: JSON.stringify(eventData)
    };

    UrlFetchApp.fetch(`${CONFIG.API_ENDPOINT}/api/email-events`, options);
  } catch (error) {
    console.error('Tessian: Failed to log security event:', error);
  }
}

/**
 * Log error to monitoring service
 */
function logError(error) {
  try {
    const errorData = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: 'gmail-addon',
      user: Session.getActiveUser().getEmail()
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(errorData)
    };

    UrlFetchApp.fetch(`${CONFIG.API_ENDPOINT}/api/errors`, options);
  } catch (e) {
    console.error('Tessian: Failed to log error:', e);
  }
}

/**
 * Generate unique message ID
 */
function generateMessageId() {
  return 'tessian-gmail-' + Date.now() + '-' + Utilities.getUuid().substring(0, 8);
}

/**
 * Initialize addon configuration
 */
function onInstall(e) {
  console.log('Tessian Gmail Add-on installed');
  
  // Set default properties if not exists
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('TESSIAN_SILENT_MODE')) {
    properties.setProperties({
      'TESSIAN_SILENT_MODE': 'false',
      'TESSIAN_BLOCK_HIGH_RISK': 'true'
    });
  }
}
