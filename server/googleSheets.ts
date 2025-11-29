import { google } from 'googleapis';

export const QUIZ_SESSIONS_SPREADSHEET_ID = '1VT6hlq-AM1DKjB4l9SrFx_WqqPwFjI3cCZpZnjoRvRI';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getGoogleSheetsClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function createOrGetSpreadsheet(title: string): Promise<string> {
  const sheets = await getGoogleSheetsClient();
  const drive = await getGoogleDriveClient();
  
  const response = await drive.files.list({
    q: `name='${title}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
  });
  
  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }
  
  const createResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: title,
      },
    },
  });
  
  return createResponse.data.spreadsheetId!;
}

export async function appendToSheet(
  spreadsheetId: string, 
  sheetName: string, 
  values: any[][]
): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1`,
    });
  } catch (error: any) {
    if (error.code === 400 || error.message?.includes('Unable to parse range')) {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
      const existingSheets = spreadsheet.data.sheets || [];
      
      if (!existingSheets.some(s => s.properties?.title === sheetName)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: { title: sheetName }
              }
            }]
          }
        });
      }
    }
  }
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

export async function clearAndWriteSheet(
  spreadsheetId: string,
  sheetName: string,
  values: any[][]
): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1`,
    });
  } catch (error: any) {
    if (error.code === 400 || error.message?.includes('Unable to parse range')) {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
      const existingSheets = spreadsheet.data.sheets || [];
      
      if (!existingSheets.some(s => s.properties?.title === sheetName)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: { title: sheetName }
              }
            }]
          }
        });
      }
    }
  }
  
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
  });
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

export function formatTimezone(isoDate: string): string {
  const date = new Date(isoDate);
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
  return formatter.format(date);
}

export async function autoExportQuizSession(
  session: any,
  feedback: any,
  questionsMap: Map<number, any>
): Promise<void> {
  try {
    const responses = session.responses || [];
    const responsesStr = responses
      .map((r: any) => {
        const q = questionsMap.get(r.questionId);
        const choiceText = q?.options?.[r.choice] ?? String(r.choice);
        return `Q${r.questionId}:${choiceText}`;
      })
      .join("; ");
    
    const result = session.result || {};
    const bigFive = result.bigFiveProfile || {};
    
    const row = [
      formatTimezone(session.createdAt),
      session.id || "",
      session.tier || "",
      session.mood || "",
      session.funMode ? "Yes" : "No",
      session.theme || "",
      result.mbtiType || "",
      result.mbtiBlend || "",
      result.discStyle || "",
      result.title || "",
      result.spark || "",
      bigFive.openness ?? "",
      bigFive.conscientiousness ?? "",
      bigFive.extraversion ?? "",
      bigFive.agreeableness ?? "",
      bigFive.neuroticism ?? "",
      result.totalQuestions ?? "",
      result.avgResponseTime?.toFixed(2) || "",
      result.engagement ?? "",
      feedback?.usefulApp || "",
      feedback?.resultsAccurate || "",
      feedback?.questionsEngaging || "",
      feedback?.wouldShare || "",
      feedback?.suggestions || "",
      responsesStr
    ];
    
    await appendToSheet(QUIZ_SESSIONS_SPREADSHEET_ID, "Quiz Sessions", [row]);
    console.log(`Auto-exported quiz session ${session.id} to Google Sheets`);
  } catch (error) {
    console.error("Failed to auto-export quiz session:", error);
  }
}
