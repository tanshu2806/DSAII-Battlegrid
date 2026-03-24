import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthClient, appendToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { eventType, gameType, teamSize, collegeName, referredBy, teamName, members } = await request.json();

    if (!eventType || !collegeName || !teamName || !members || !members.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const auth = await getGoogleAuthClient();
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Spreadsheet ID not configured' },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();

    // Map event type to the exact tab name in Google Sheets
    let sheetName = '';
    if (eventType === 'Battle grid') sheetName = 'BattleGrid';
    else if (eventType === 'CineQuest') sheetName = 'CineQuest';
    else if (eventType === 'Innovex') sheetName = 'Innovex';
    else if (eventType === 'Contentflux') sheetName = 'Contentflux';
    else if (eventType === 'Geovoyager') sheetName = 'Geovoyager';
    else if (eventType === 'The Spiral') sheetName = 'TheSpiral';

    if (!sheetName) {
      return NextResponse.json(
        { error: 'Invalid or unsupported Event Type' },
        { status: 400 }
      );
    }

    // Flatten array: [Event Type, College Name, Refered By, Team Name, Team Size, Captain Name, Captain Email, Captain Contact, Captain Game ID, Member 2 Name...]
    const displayEventType = gameType ? `${eventType} - ${gameType}` : eventType;
    const values = [
      timestamp,
      displayEventType,
      collegeName,
      referredBy || '',
      teamName,
      teamSize,
    ];

    // Max 5 members for all events (required for Valorant)
    const maxMembers = 5;
    for (let i = 0; i < maxMembers; i++) {
      if (i < members.length) {
        values.push(members[i].name, members[i].email, members[i].contact);
        // User's sheet has duplicate M1 Contact column (Cols I and J)
        if (i === 0) {
          values.push(members[i].contact); 
        }
        values.push(members[i].gameId || '');
      } else {
        // Padding for empty members to keep columns aligned
        // All members have 4 fields, but M1 has 5 due to duplicate contact
        const fieldsCount = (i === 0) ? 5 : 4;
        for (let j = 0; j < fieldsCount; j++) {
          values.push('');
        }
      }
    }

    const range = `${sheetName}!A:AC`;
    await appendToSheet(auth, spreadsheetId, values, range);

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}