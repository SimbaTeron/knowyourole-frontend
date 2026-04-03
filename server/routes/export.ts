import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { registerBlueprintExportRoute } from "./export-blueprint";

interface QuestionEntry {
  id: number;
  tier: string;
  psych?: string;
  responseType?: string;
  options?: string[];
  [key: string]: unknown;
}

export function registerExportRoutes(app: Express) {
  app.post("/api/export/sheets/sessions", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet, formatTimezone } = await import("../googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      const allSessions = await storage.getAllQuizSessions();
      const allFeedback = await storage.getAllFeedback();
      
      const feedbackMap = new Map<string, any>();
      allFeedback.forEach(f => {
        if (f.sessionId) feedbackMap.set(f.sessionId, f);
      });
      
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      const questionsMap = new Map<number, QuestionEntry>();
      questionsData.questions.forEach((q: QuestionEntry) => questionsMap.set(q.id, q));
      
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Quiz Data");
      
      const sessionsHeader = [
        "Timestamp (Local)", "Session ID", "Age Tier", "Mood", "Fun Mode", "Theme",
        "MBTI Type", "MBTI Blend", "DISC Style", "Title", "Spark",
        "Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism",
        "Total Questions", "Avg Response Time (s)", "Engagement Score",
        "Useful App?", "Results Accurate?", "Questions Engaging?", "Would Share?", "Suggestions",
        "All Responses (Q#:Choice)"
      ];
      
      const sessionsRows = [sessionsHeader];
      
      for (const session of allSessions) {
        const feedback = feedbackMap.get(session.id);
        const responses = session.responses || [];
        const responsesStr = responses
          .map((r: { questionId: number; choice: number }) => {
            const q = questionsMap.get(r.questionId);
            const choiceText = q?.options?.[r.choice] ?? String(r.choice);
            return `Q${r.questionId}:${choiceText}`;
          })
          .join("; ");
        
        const result = session.result || {};
        const bigFive = result.bigFiveProfile || {};
        
        sessionsRows.push([
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
        ]);
      }
      
      await clearAndWriteSheet(spreadsheetId, "Quiz Sessions", sessionsRows);
      
      res.json({ 
        success: true, 
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sessionsExported: allSessions.length
      });
    } catch (error) {
      console.error("Google Sheets export error:", error);
      res.status(500).json({ error: "Failed to export to Google Sheets" });
    }
  });

  app.post("/api/export/sheets/questions", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet } = await import("../googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Questions Database");
      
      const questionsHeader = [
        "ID", "Prompt", "Left Option", "Right Option", "Left Description", "Right Description",
        "Left Meta", "Right Meta", "Psychology Type", "Response Type", "Time (s)", "Age Tier", 
        "Version", "Paid", "Wildcard", "Is 2x", "Boost Range Min", "Boost Range Max", "Notes"
      ];
      
      const questionsRows = [questionsHeader];
      
      for (const q of questionsData.questions) {
        const boostRange = q.boostRange || [0.7, 0.9];
        questionsRows.push([
          q.id, q.prompt, q.options?.[0] || "", q.options?.[1] || "",
          q.leftDesc || "", q.rightDesc || "", q.optionMeta?.[0] || "", q.optionMeta?.[1] || "",
          q.psych || "", q.responseType || "binary", q.time || "", q.tier || "",
          q.version || "", q.paid ? "Yes" : "No", q.wildcard ? "Yes" : "No", q.is2x ? "Yes" : "No",
          boostRange[0], boostRange[1], q.notes || ""
        ]);
      }
      
      const summaryRows = [
        ["KnowRole Questions Database Summary"], [""],
        ["Total Questions", questionsData.questions.length],
        ["Binary Questions", questionsData.questions.filter((q: QuestionEntry) => !q.responseType || q.responseType === "binary").length],
        ["Slider Questions", questionsData.questions.filter((q: QuestionEntry) => q.responseType === "slider").length],
        [""], ["By Psychology Type:"],
        ["MBTI", questionsData.questions.filter((q: QuestionEntry) => q.psych?.startsWith("MBTI")).length],
        ["DISC", questionsData.questions.filter((q: QuestionEntry) => q.psych?.startsWith("DISC")).length],
        ["Big Five", questionsData.questions.filter((q: QuestionEntry) => q.psych?.startsWith("Big5")).length],
        ["Critical Thinking", questionsData.questions.filter((q: QuestionEntry) => q.psych === "Critical").length],
        ["First Principles", questionsData.questions.filter((q: QuestionEntry) => q.psych === "FirstPrinciples").length],
        [""], ["By Age Tier:"],
        ["All Tiers", questionsData.questions.filter((q: QuestionEntry) => q.tier === "all").length],
        ["Mini (7-12)", questionsData.questions.filter((q: QuestionEntry) => q.tier === "7-12").length],
        ["Teen (13-18)", questionsData.questions.filter((q: QuestionEntry) => q.tier === "13-18").length],
        ["Young Adult (19-25)", questionsData.questions.filter((q: QuestionEntry) => q.tier === "19-25").length],
        ["Adult (25+)", questionsData.questions.filter((q: QuestionEntry) => q.tier === "25+").length],
        [""], ["Timer Configuration:"],
        ["Mini (7-12)", `${questionsData.tierConfig["7-12"]?.maxTime || 12}s base, ${questionsData.tierConfig["7-12"]?.baseCount || 16} questions`],
        ["Teen (13-18)", `${questionsData.tierConfig["13-18"]?.maxTime || 12}s base, ${questionsData.tierConfig["13-18"]?.baseCount || 22} questions`],
        ["Young Adult (19-25)", `${questionsData.tierConfig["19-25"]?.maxTime || 12}s base, ${questionsData.tierConfig["19-25"]?.baseCount || 28} questions`],
        ["Adult (25+)", `${questionsData.tierConfig["25+"]?.maxTime || 12}s base, ${questionsData.tierConfig["25+"]?.baseCount || 34} questions`],
        ["Slider Bonus", "+3 seconds"], ["Badge Bonus", "+2 seconds"],
        [""], ["Export Date", new Date().toISOString()]
      ];
      
      await clearAndWriteSheet(spreadsheetId, "Summary", summaryRows);
      await clearAndWriteSheet(spreadsheetId, "Questions", questionsRows);
      
      res.json({ 
        success: true, spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        questionsExported: questionsData.questions.length
      });
    } catch (error) {
      console.error("Google Sheets questions export error:", error);
      res.status(500).json({ error: "Failed to export questions to Google Sheets" });
    }
  });

  app.post("/api/export/sheets/colors", async (_req: Request, res: Response) => {
    try {
      const { createOrGetSpreadsheet, clearAndWriteSheet } = await import("../googleSheets");
      const fs = await import("fs");
      const path = await import("path");
      
      const themesPath = path.join(process.cwd(), "client/src/data/cityThemes.ts");
      const themesContent = fs.readFileSync(themesPath, "utf-8");
      
      const spreadsheetId = await createOrGetSpreadsheet("KnowRole Color Schemes");
      
      const cityThemePattern = /"([^"]+)":\s*\{\s*city:\s*"([^"]+)",\s*(?:state:\s*"([^"]*)",\s*)?country:\s*"([^"]+)",\s*team:\s*"([^"]+)",\s*sport:\s*"([^"]+)",\s*colors:\s*\{\s*primary:\s*"([^"]+)",\s*secondary:\s*"([^"]+)",\s*accent:\s*"([^"]+)"\s*\},\s*textOnPrimary:\s*"([^"]+)",\s*textOnSecondary:\s*"([^"]+)"/g;
      
      const colorHeader = [
        "City Key", "City Name", "State", "Country", "Team", "Sport", 
        "Primary Color (HEX)", "Secondary Color (HEX)", "Accent Color (HEX)",
        "Text on Primary", "Text on Secondary"
      ];
      
      const colorRows = [colorHeader];
      let match;
      
      while ((match = cityThemePattern.exec(themesContent)) !== null) {
        colorRows.push([
          match[1], match[2], match[3] || "", match[4], match[5], match[6],
          match[7], match[8], match[9], match[10], match[11]
        ]);
      }
      
      await clearAndWriteSheet(spreadsheetId, "City Color Schemes", colorRows);
      
      const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      
      const tierHeader = ["Age Tier", "Base Question Count", "Max Time (seconds)", "Swipe Style"];
      const tierRows = [tierHeader];
      
      for (const [tier, config] of Object.entries(questionsData.tierConfig)) {
        const cfg = config as { baseCount: number; maxTime: number; swipeStyle: string };
        tierRows.push([tier, cfg.baseCount.toString(), cfg.maxTime.toString(), cfg.swipeStyle]);
      }
      
      await clearAndWriteSheet(spreadsheetId, "Tier Configuration", tierRows);
      
      res.json({ 
        success: true, spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        colorSchemesExported: colorRows.length - 1,
        tierConfigsExported: tierRows.length - 1
      });
    } catch (error) {
      console.error("Google Sheets color schemes export error:", error);
      res.status(500).json({ error: "Failed to export color schemes to Google Sheets" });
    }
  });

  registerBlueprintExportRoute(app);
}
