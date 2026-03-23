import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export async function getGoogleAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    },
    scopes: SCOPES,
  });

  return auth;
}

export async function appendToSheet(
  auth: any,
  spreadsheetId: string,
  values: any[],
  range: string = 'Sheet1!A:Z'
) {
  const sheets = google.sheets({ version: 'v4', auth });

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });

  return result.data;
}

// Finds the row where the captain email matches (column G = index 6),
// then writes Transaction ID to column V and Screenshot URL to column W.
// Column layout per user's sheet:
// A=Timestamp, B=EventType, C=College, D=TeamName, E=TeamSize,
// F=M1Name, G=M1Email, H=M1Contact, I=M1GameID, J=M2Name, K=M2Email, L=M2Contact, M=M2GameID,
// N=M3Name, O=M3Email, P=M3Contact, Q=M3GameID, R=M4Name, S=M4Email, T=M4Contact, U=M4GameID,
// V=TransactionID, W=ScreenshotURL
export async function updateRowWithPayment(
  auth: any,
  spreadsheetId: string,
  sheetName: string,
  captainEmail: string,
  transactionId: string,
  screenshotUrl: string
): Promise<boolean> {
  const sheets = google.sheets({ version: 'v4', auth });

  // Read all data from the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values || [];

  // Find the last row where captain email matches (column G = index 6)
  let targetRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][6] === captainEmail) {
      targetRowIndex = i; // keep going — match the most recent entry
    }
  }

  if (targetRowIndex === -1) {
    console.warn(`⚠️ No row found for email: ${captainEmail} in sheet: ${sheetName}`);
    return false;
  }

  // Write Transaction ID to column V (21st col) and Screenshot URL to column W (22nd col)
  // This matches the fixed header: ...M4GameID | Transaction ID | Screenshot
  const cellRange = `${sheetName}!V${targetRowIndex + 1}:W${targetRowIndex + 1}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: cellRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[transactionId, screenshotUrl]],
    },
  });

  return true;
}


export async function uploadFileToDrive(
  auth: any,
  fileBuffer: Buffer,
  fileName: string,
  folderId?: string
) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType: 'image/jpeg',
    body: Readable.from(fileBuffer),
  };

  const result = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink',
  });

  return result.data;
}
