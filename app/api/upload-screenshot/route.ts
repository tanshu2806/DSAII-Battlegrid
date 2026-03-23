import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthClient, updateRowWithPayment } from '@/lib/google-sheets';

// Map event type to sheet tab name (must match submit-form/route.ts)
const EVENT_SHEET_MAP: Record<string, string> = {
  'Battle grid': 'BattleGrid',
  'CineQuest': 'CineQuest',
  'Innovex': 'Innovex',
  'Contentflux': 'Contentflux',
  'Geovoyager': 'Geovoyager',
  'The Spiral': 'TheSpiral',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;
    const transactionId = formData.get('transactionId') as string;
    const eventType = formData.get('eventType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email not provided' }, { status: 400 });
    }

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID not provided' }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ImgBB API key not configured' }, { status: 500 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Upload to ImgBB
    const imgbbForm = new FormData();
    imgbbForm.append('key', apiKey);
    imgbbForm.append('image', base64);
    imgbbForm.append('name', `payment-${email}-${Date.now()}`);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm,
    });

    const result = await response.json();

    if (!result.success) {
      console.error('ImgBB upload error:', result);
      return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
    }

    const screenshotUrl = result.data.url;

    // Update the same row in the event sheet with transaction ID + screenshot URL
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
    const sheetName = eventType ? EVENT_SHEET_MAP[eventType] : undefined;

    if (spreadsheetId && sheetName) {
      try {
        const auth = await getGoogleAuthClient();
        const updated = await updateRowWithPayment(
          auth,
          spreadsheetId,
          sheetName,
          email,
          transactionId,
          screenshotUrl
        );
        if (updated) {
          console.log(`✅ Transaction ID written to row for ${email} in ${sheetName}`);
        } else {
          console.warn(`⚠️ Could not find row for ${email} in ${sheetName}`);
        }
      } catch (sheetError: any) {
        console.error('❌ Google Sheets update error:', sheetError?.message || sheetError);
      }
    } else {
      console.warn('⚠️ Missing spreadsheetId or unknown eventType:', eventType);
    }

    return NextResponse.json({
      success: true,
      message: 'Screenshot uploaded successfully',
      fileLink: screenshotUrl,
      deleteLink: result.data.delete_url,
      transactionId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
  }
}