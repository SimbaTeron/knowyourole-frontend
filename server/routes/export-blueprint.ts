import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { getOverviewRows, getTechRows, getSchemaRows } from "../data/blueprint-overview";
import { getAlgorithmRows } from "../data/blueprint-algorithm";
import { getApiRows, getComponentRows, getPremiumInsightsRows } from "../data/blueprint-components";
import { getThinkingRows, getBadgeRows, getMoodRows, getResultsRows } from "../data/blueprint-features";

export function registerBlueprintExportRoute(app: Express) {
  app.post("/api/export/sheets/full", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet, formatTimezone, getPSTTimestamp } = await import("../googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Blueprint");
      const ts = getPSTTimestamp();

      await clearAndWriteSheet(spreadsheetId, "1. App Overview", getOverviewRows(ts));
      await clearAndWriteSheet(spreadsheetId, "2. Technical Stack", getTechRows());
      await clearAndWriteSheet(spreadsheetId, "3. Database Schema", getSchemaRows(ts));
      await clearAndWriteSheet(spreadsheetId, "4. Quiz Algorithm", getAlgorithmRows(ts));
      await clearAndWriteSheet(spreadsheetId, "5. API Endpoints", getApiRows());
      await clearAndWriteSheet(spreadsheetId, "6. Component Map", getComponentRows());

      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

      const questionsHeader = [
        "ID", "Prompt", "Left Option", "Right Option", "Left Meta", "Right Meta",
        "Psychology Type", "Timer (s)", "Age Tier", "Version", "Paid", "Wildcard"
      ];
      const questionsRows: any[][] = [questionsHeader];
      for (const q of questionsData.questions) {
        questionsRows.push([
          q.id, q.prompt, q.options[0], q.options[1], q.optionMeta[0], q.optionMeta[1],
          q.psych, q.time, q.tier, q.version, q.paid ? "Yes" : "No", q.wildcard ? "Yes" : "No"
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "7. Questions Database", questionsRows);

      const themesPath = path.join(process.cwd(), "client/src/data/cityThemes.ts");
      const themesContent = fs.readFileSync(themesPath, "utf-8");
      const cityThemePattern = /"([^"]+)":\s*\{\s*city:\s*"([^"]+)",\s*(?:state:\s*"([^"]*)",\s*)?country:\s*"([^"]+)",\s*team:\s*"([^"]+)",\s*sport:\s*"([^"]+)",\s*colors:\s*\{\s*primary:\s*"([^"]+)",\s*secondary:\s*"([^"]+)",\s*accent:\s*"([^"]+)"\s*\},\s*textOnPrimary:\s*"([^"]+)",\s*textOnSecondary:\s*"([^"]+)"/g;
      const colorRows: any[][] = [["City Key", "City Name", "State", "Country", "Team", "Sport",
        "Primary (HEX)", "Secondary (HEX)", "Accent (HEX)", "Text on Primary", "Text on Secondary"]];
      let match;
      while ((match = cityThemePattern.exec(themesContent)) !== null) {
        colorRows.push([match[1], match[2], match[3] || "", match[4], match[5], match[6],
          match[7], match[8], match[9], match[10], match[11]]);
      }
      await clearAndWriteSheet(spreadsheetId, "8. City Themes", colorRows);

      const tierDisplayNames: Record<string, string> = {
        "7-12": "Mini Explorer (Ages 12 & under)", "13-18": "Teen (Ages 13-18)",
        "19-25": "Young Adult (Ages 19-25)", "25+": "Adult (Ages 25+)"
      };
      const breakFlows: Record<string, string> = {
        "7-12": "6->MC1->6->Superpower->6->Mystery->7->MC2 (25 total)",
        "13-18": "8->MC1->7->Superpower->7->Mystery->8->MC2 (30 total)",
        "19-25": "9->MC1->9->Superpower->9->Mystery->8->MC2 (35 total)",
        "25+": "10->MC1->10->Superpower->10->Mystery->10->MC2 (40 total)"
      };
      const tierRows: any[][] = [["Age Tier", "Display Name", "Questions", "Timer (s)", "Swipe Style", "Break Flow"]];
      for (const [tier, config] of Object.entries(questionsData.tierConfig)) {
        const cfg = config as { baseCount: number; maxTime: number; swipeStyle: string };
        tierRows.push([tier, tierDisplayNames[tier] || tier, cfg.baseCount.toString(),
          cfg.maxTime.toString(), cfg.swipeStyle, breakFlows[tier] || ""]);
      }
      await clearAndWriteSheet(spreadsheetId, "9. Tier Configuration", tierRows);

      const allSessions = await storage.getAllQuizSessions();
      const allFeedback = await storage.getAllFeedback();
      const feedbackMap = new Map<string, any>();
      allFeedback.forEach(f => { if (f.sessionId) feedbackMap.set(f.sessionId, f); });

      const sessionsRows: any[][] = [["Timestamp", "Session ID", "Age Tier", "Mood", "Fun Mode", "Theme",
        "MBTI Type", "DISC Style", "Primary Role", "Openness", "Conscientiousness",
        "Extraversion", "Agreeableness", "Neuroticism", "Engagement Score",
        "Useful?", "Accurate?", "Engaging?", "Would Share?", "Suggestions"]];
      for (const session of allSessions) {
        const feedback = feedbackMap.get(session.id);
        const result = (session.result || {}) as any;
        const bigFive = result.bigFiveProfile || {};
        sessionsRows.push([
          formatTimezone(session.createdAt), session.id || "", session.tier || "", session.mood || "",
          session.funMode ? "Yes" : "No", session.theme || "", result.mbtiType || "",
          result.discStyle || "", result.primaryRole?.title || "",
          bigFive.openness ?? "", bigFive.conscientiousness ?? "", bigFive.extraversion ?? "",
          bigFive.agreeableness ?? "", bigFive.neuroticism ?? "", result.engagement ?? "",
          feedback?.usefulApp || "", feedback?.resultsAccurate || "",
          feedback?.questionsEngaging || "", feedback?.wouldShare || "", feedback?.suggestions || ""
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "10. Quiz Sessions", sessionsRows);

      const feedbackRows: any[][] = [["Timestamp", "Session ID", "MBTI Type", "DISC Style", "Primary Role",
        "Age Tier", "Mood", "Fun Mode", "Useful App?", "Results Accurate?",
        "Questions Engaging?", "Would Share?", "Suggestions"]];
      for (const f of allFeedback) {
        feedbackRows.push([
          f.createdAt ? formatTimezone(f.createdAt.toISOString()) : "", f.sessionId || "",
          f.mbtiType || "", f.discStyle || "", f.primaryRole || "", f.tier || "",
          f.mood || "", f.funMode ? "Yes" : "No", f.usefulApp || "",
          f.resultsAccurate || "", f.questionsEngaging || "", f.wouldShare || "",
          f.suggestions || ""
        ]);
      }
      await clearAndWriteSheet(spreadsheetId, "11. Feedback Data", feedbackRows);

      await clearAndWriteSheet(spreadsheetId, "12. Premium Insights", getPremiumInsightsRows(ts));
      await clearAndWriteSheet(spreadsheetId, "13. Sharpen Thinking", getThinkingRows(ts));
      await clearAndWriteSheet(spreadsheetId, "14. Badge System", getBadgeRows(ts));
      await clearAndWriteSheet(spreadsheetId, "15. Mood Effects", getMoodRows(ts));
      await clearAndWriteSheet(spreadsheetId, "16. Results Layout", getResultsRows(ts));

      res.json({
        success: true, spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheets: ["1. App Overview", "2. Technical Stack", "3. Database Schema", "4. Quiz Algorithm",
          "5. API Endpoints", "6. Component Map", "7. Questions Database", "8. City Themes",
          "9. Tier Configuration", "10. Quiz Sessions", "11. Feedback Data", "12. Premium Insights",
          "13. Sharpen Thinking", "14. Badge System", "15. Mood Effects", "16. Results Layout"],
        questionsExported: questionsData.questions.length,
        sessionsExported: allSessions.length,
        feedbackExported: allFeedback.length,
        cityThemesExported: colorRows.length - 1,
        premiumCategories: 6,
        thinkingQuestions: 60
      });
    } catch (error) {
      console.error("Full data export error:", error);
      res.status(500).json({ error: "Failed to export complete blueprint to Google Sheets" });
    }
  });
}
