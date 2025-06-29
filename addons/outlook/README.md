# Tessian Outlook Add-in

## Overview

The Tessian Outlook Add-in provides real-time email security analysis directly within Microsoft Outlook. It monitors outbound emails for threats, data leaks, and policy violations before they are sent.

## Installation for Testing

### Option 1: Sideload for Development/Testing

1. **Open Outlook Web App or Desktop Outlook 365**
2. **Navigate to Add-ins**:
   - In Outlook Web: Click the gear icon (Settings) → View all Outlook settings → Mail → Manage add-ins
   - In Outlook Desktop: File → Manage Add-ins → Get Add-ins → My add-ins

3. **Upload the Manifest**:
   - Click "Add a custom add-in" → "Add from file"
   - Select the `manifest.xml` file from this directory
   - Confirm installation

### Option 2: Enterprise Deployment (Production)

For organizational deployment, your IT administrator needs to:

1. **Upload to Microsoft 365 Admin Center**:
   - Admin Center → Settings → Services & add-ins → Deploy Add-in
   - Upload the `manifest.xml` file
   - Assign to users/groups

2. **Configure App Domains**:
   - Ensure `tessian-addon.azurewebsites.net` is whitelisted
   - Configure any necessary firewall rules

## How to Use

### Compose Mode Protection

1. **Start composing an email** in Outlook
2. **The Tessian panel appears** automatically in the compose window
3. **Security analysis runs** when you click Send
4. **Warnings appear** if risks are detected:
   - External recipients
   - Suspicious content
   - Policy violations
   - Potential data leaks

### Warning Types

- **🟢 Green**: Email appears safe to send
- **🟡 Yellow**: Medium risk - review recommended
- **🔴 Red**: High risk - sending blocked or requires confirmation

### Security Modules Active

- **Guardian**: Prevents misdirected emails
- **Enforcer**: Blocks unauthorized data sharing
- **Defender**: Detects phishing attempts
- **Architect**: Behavioral analysis
- **Coach**: User training prompts

## Configuration

### API Endpoint Setup

Update the manifest.xml AppDomains to point to your Tessian instance:

```xml
<AppDomains>
  <AppDomain>https://your-tessian-instance.com</AppDomain>
  <AppDomain>https://api.your-domain.com</AppDomain>
</AppDomains>
```

### Silent Mode

To enable silent monitoring without user warnings:
- Log into Tessian dashboard
- Navigate to Settings → Email Client Integration
- Enable "Silent Mode" for specific users/groups

## Files Structure

- `manifest.xml` - Add-in configuration and permissions
- `taskpane.js` - Main JavaScript logic for email analysis
- `warning-pane.html` - UI for displaying security warnings

## Troubleshooting

### Add-in Not Loading
- Verify manifest.xml is valid XML
- Check AppDomains are accessible
- Ensure SSL certificates are valid

### Security Analysis Not Working
- Verify API endpoint is reachable
- Check authentication tokens
- Review browser console for errors

### Permissions Issues
- Ensure ReadWriteItem permission is granted
- Check corporate firewall settings
- Verify Office 365 admin approval

## Testing Email Scenarios

Try these test scenarios to verify the add-in works:

1. **External Email**: Send to gmail.com address
2. **Suspicious Content**: Include words like "urgent", "confidential"
3. **Attachments**: Send files to external recipients
4. **Large Recipient Lists**: Test with multiple external recipients

## Support

For technical issues or enterprise deployment assistance:
- Email: support@tessian.com
- Documentation: https://docs.tessian.com/outlook-addon
- Admin Portal: https://admin.tessian.com