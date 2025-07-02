# SecureFlow Outlook COM Add-in

This is a COM add-in for Microsoft Outlook that provides real-time email security analysis and threat protection.

## Features

- **Real-time Email Scanning**: Analyze emails for phishing, malware, and other security threats
- **Risk Scoring**: Automatic risk assessment with color-coded threat indicators
- **Security Dashboard**: View metrics and threat intelligence within Outlook
- **Interactive Warnings**: Get notified about high-risk emails with actionable information
- **Silent Mode**: Optional background scanning without user interruption

## Installation Instructions for Local Outlook

### Prerequisites

1. **Microsoft Outlook** (Desktop version 2016 or later)
2. **Admin Rights** on your Windows PC
3. **SecureFlow Server** running locally (this Replit project)

### Step 1: Download the Manifest File

1. Start the SecureFlow server (this Replit project should be running)
2. Download the manifest file by visiting: `http://localhost:5000/outlook-addin/manifest.xml`
3. Save it as `SecureFlow-manifest.xml` to your desktop

### Step 2: Update the Manifest URLs

Since you'll be running this locally, you need to update the manifest file to point to your local server:

1. Open the downloaded `SecureFlow-manifest.xml` file in a text editor
2. Replace all instances of `https://localhost:5000` with your actual local IP address
   - Find your IP address by running `ipconfig` in Command Prompt
   - Use the IP address (e.g., `http://192.168.1.100:5000`)
3. Save the file

### Step 3: Install the Add-in

#### Method 1: Sideload via Outlook (Recommended)

1. Open **Microsoft Outlook** on your PC
2. Go to **File** → **Options** → **Add-ins**
3. Click **Manage: COM Add-ins** → **Go**
4. Click **Developer** tab in Outlook ribbon (if not visible, enable it in Options)
5. Click **Add-ins** → **My Add-ins** → **Add a custom add-in** → **Add from file**
6. Browse and select your `SecureFlow-manifest.xml` file
7. Click **Install** and confirm any security warnings

#### Method 2: Registry Installation (Advanced)

1. Open **Registry Editor** (regedit) as Administrator
2. Navigate to: `HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\Developer`
3. Create a new String Value with:
   - **Name**: `SecureFlow`
   - **Value**: `C:\path\to\your\SecureFlow-manifest.xml`
4. Restart Outlook

### Step 4: Verify Installation

1. **Restart Outlook** completely
2. Open any email message
3. Look for the **SecureFlow** group in the ribbon
4. You should see:
   - **SecureFlow Panel** button (opens the security dashboard)
   - **Scan Email** button (performs quick threat analysis)

### Step 5: Test the Add-in

1. **Open an email** in Outlook
2. Click **Scan Email** button in the SecureFlow ribbon group
3. You should see a notification indicating the email's risk level
4. Click **SecureFlow Panel** to view detailed security metrics

## Troubleshooting

### Common Issues

**Add-in not appearing:**
- Ensure Outlook is completely closed and reopened
- Check if the manifest file path is correct
- Verify the SecureFlow server is running on the correct port

**Connection errors:**
- Make sure the SecureFlow server (this Replit project) is running
- Verify your local IP address is correct in the manifest
- Check Windows Firewall isn't blocking port 5000

**Security warnings:**
- Outlook may show security warnings for unsigned add-ins
- Click "Yes" or "Trust" to proceed with installation
- This is normal for development/testing environments

### Enable Developer Mode

If you don't see the Developer tab:

1. Go to **File** → **Options** → **Customize Ribbon**
2. Check **Developer** in the right panel
3. Click **OK**

## Security Features Tested

The add-in will detect and warn about:

- **Phishing attempts**: Urgent language, verification requests
- **Suspicious links**: Shortened URLs, non-HTTPS links
- **Financial fraud**: Banking, payment, cryptocurrency requests
- **Social engineering**: Click-here, download-now language
- **Malware indicators**: Suspicious attachments, executable files

## Development Notes

- The add-in uses the Office JavaScript API
- All analysis is performed by connecting to the SecureFlow backend
- Risk scores range from 0-100 with color-coded indicators
- Supports both reading and composing emails

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify the SecureFlow server logs for API calls
3. Ensure all URLs in the manifest point to your running server