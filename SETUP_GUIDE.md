# Payment Form Setup Guide

This is a multi-step form application built with Next.js, Framer Motion, and Google Services integration.

## Features

- Step 1: Collect user details (name, contact, email)
- Step 2: Upload payment screenshot
- Step 3: Success confirmation
- Data saved to Google Sheets
- Screenshots uploaded to Google Drive
- Smooth animations with Framer Motion
- Zinc black theme with Poppins font

## Prerequisites

1. **Google Cloud Project** - Create a new project at https://console.cloud.google.com
2. **Service Account** - Set up a service account with these scopes:
   - Google Sheets API
   - Google Drive API

## Step 1: Create a Service Account

1. Go to Google Cloud Console → "Service Accounts"
2. Click "Create Service Account"
3. Fill in the account name (e.g., "payment-form")
4. Grant these roles:
   - Editor (for simplicity; can be more restrictive)
5. Create a key (JSON format)
6. Download the JSON file

## Step 2: Extract Service Account Credentials

From the downloaded JSON file, extract these values:
- `project_id` → `GOOGLE_PROJECT_ID`
- `private_key_id` → `GOOGLE_PRIVATE_KEY_ID`
- `private_key` → `GOOGLE_PRIVATE_KEY` (keep the \n escape sequences)
- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `client_id` → `GOOGLE_CLIENT_ID`
- `client_x509_cert_url` → `GOOGLE_CLIENT_X509_CERT_URL`

## Step 3: Create Google Sheet

1. Create a new Google Sheet at https://sheets.google.com
2. Add headers in row 1: `Name | Contact | Email | Timestamp`
3. Share the sheet with your service account email
4. Copy the spreadsheet ID from the URL
5. Set `NEXT_PUBLIC_SPREADSHEET_ID` in your environment variables

## Step 4: Create Google Drive Folder (Optional)

1. Create a folder in Google Drive
2. Share it with your service account email
3. Copy the folder ID
4. Set `NEXT_PUBLIC_DRIVE_FOLDER_ID` in your environment variables

## Step 5: Environment Variables

Create a `.env.local` file in the root directory:

```
# Google Service Account
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=123456789
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Google Sheets
NEXT_PUBLIC_SPREADSHEET_ID=1abc2def3ghi4jkl5mno6pqr7stu8vwx9y0z

# Google Drive (Optional)
NEXT_PUBLIC_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

## Step 6: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 7: Run the Application

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see the form.

## Project Structure

```
app/
├── api/
│   ├── submit-form/
│   │   └── route.ts         # Form submission endpoint
│   └── upload-screenshot/
│       └── route.ts         # Screenshot upload endpoint
├── page.tsx                 # Main page
├── layout.tsx               # Root layout with Poppins font
└── globals.css              # Global styles with zinc theme

components/
├── FormStep1.tsx            # User details form
├── FormStep2.tsx            # Screenshot upload
├── SuccessScreen.tsx        # Success confirmation
└── FormContainer.tsx        # Multi-step form orchestrator

lib/
└── google-sheets.ts         # Google Services utilities
```

## Design Details

- **Color Scheme**: Zinc black (bg-zinc-950, text-zinc-50)
- **Font**: Poppins (weights: 400, 500, 600, 700)
- **Animations**: Framer Motion with staggered children effects
- **Layout**: Flexbox-based responsive design

## Troubleshooting

### "Spreadsheet ID not configured"
- Ensure `NEXT_PUBLIC_SPREADSHEET_ID` is set in `.env.local`

### "Failed to submit form"
- Check service account permissions on Google Sheet
- Verify the sheet exists and is accessible
- Check console logs for detailed error messages

### "Failed to upload screenshot"
- Ensure service account has Drive API permissions
- Verify the Drive folder exists (if using custom folder)
- Check file size is under 5MB

### "Invalid credentials"
- Verify all `GOOGLE_*` environment variables are correctly set
- Ensure `GOOGLE_PRIVATE_KEY` has proper escape sequences (\n)
- Check service account JSON file hasn't expired

## Deployment

When deploying to Vercel:

1. Add all environment variables in Vercel Project Settings
2. Make sure to properly escape the private key:
   - Copy the entire private key from the JSON file
   - Paste it directly into Vercel env variable (it will handle escaping)
3. Test the form after deployment

## Security Notes

- Never commit `.env.local` to version control
- Service account credentials should be treated as secrets
- Consider using more restrictive IAM roles for production
- Limit the service account to specific spreadsheets/folders

## Support

For issues with Google APIs, refer to:
- Google Sheets API: https://developers.google.com/sheets/api
- Google Drive API: https://developers.google.com/drive/api
- Service Accounts: https://cloud.google.com/docs/authentication/service-accounts
