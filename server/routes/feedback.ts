import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { seedAll } from "../seedData";
import { checkRateLimit } from "../services/scoring";

const exportedSessions = new Set<string>();

export function registerFeedbackRoutes(app: Express) {
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = {
        sessionId: req.body.sessionId || null,
        usefulApp: req.body.usefulApp || null,
        resultsAccurate: req.body.resultsAccurate || null,
        questionsEngaging: req.body.questionsEngaging || null,
        wouldShare: req.body.wouldShare || null,
        suggestions: req.body.suggestions || null,
        mbtiType: req.body.mbtiType || null,
        discStyle: req.body.discStyle || null,
        primaryRole: req.body.primaryRole || null,
        tier: req.body.tier || null,
        mood: req.body.mood || null,
        funMode: req.body.funMode ?? null,
      };

      const saved = await storage.saveFeedback(feedbackData);
      console.log("Feedback saved:", saved.id);
      
      if (feedbackData.sessionId && !exportedSessions.has(feedbackData.sessionId)) {
        exportedSessions.add(feedbackData.sessionId);
        try {
          const { autoExportQuizSession } = await import("../googleSheets");
          const fs = await import("fs");
          const path = await import("path");
          
          const session = await storage.getQuizSession(feedbackData.sessionId);
          if (session) {
            const questionsPath = path.join(process.cwd(), "client/src/data/questions.json");
            const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
            const questionsArray = questionsData.questions || questionsData || [];
            const questionsMap = new Map<number, any>();
            questionsArray.forEach((q: any) => questionsMap.set(q.id, q));
            
            await autoExportQuizSession(session, feedbackData, questionsMap);
          }
        } catch (exportError) {
          exportedSessions.delete(feedbackData.sessionId);
          console.error("Auto-export failed (non-blocking):", exportError);
        }
      }
      
      res.json({ success: true, id: saved.id });
    } catch (error) {
      console.error("Feedback save error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.get("/api/feedback", async (_req: Request, res: Response) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      res.json({ feedback: allFeedback });
    } catch (error) {
      console.error("Feedback fetch error:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.post("/api/generate-pdf", async (req: Request, res: Response) => {
    if (!checkRateLimit(req, 5, 3600000)) {
      return res.status(429).json({ error: "Rate limit exceeded. Maximum 5 PDF generations per hour." });
    }
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const { sessionId, result, mood, tier } = req.body;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const purple = rgb(0.65, 0.55, 0.98);
      const darkPurple = rgb(0.4, 0.3, 0.7);
      const darkBg = rgb(0.04, 0.04, 0.06);
      const cardBg = rgb(0.07, 0.07, 0.1);
      const lightText = rgb(0.97, 0.98, 0.99);
      const mutedText = rgb(0.58, 0.64, 0.72);
      const cyan = rgb(0.4, 0.91, 0.98);
      
      page.drawRectangle({ x: 0, y: 0, width, height, color: darkBg });
      
      let y = height - 50;
      
      page.drawRectangle({ x: 40, y: y - 70, width: width - 80, height: 80, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("KnowYouRole", { x: 55, y: y - 30, size: 32, font: helveticaBold, color: purple });
      page.drawText("Personality Discovery Report", { x: 55, y: y - 55, size: 14, font: helvetica, color: mutedText });
      
      y -= 100;
      
      page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("YOUR PERSONALITY TYPE", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      
      page.drawText(result?.mbtiType || "XXXX", { x: 55, y: y - 65, size: 48, font: helveticaBold, color: lightText });
      
      page.drawText(result?.title || "Your Unique Type", { x: 55, y: y - 95, size: 16, font: helveticaBold, color: purple });
      
      const spark = result?.spark || "Discover your unique strengths and potential!";
      const sparkLines = spark.length > 70 ? [spark.slice(0, 70), spark.slice(70)] : [spark];
      sparkLines.forEach((line: string, i: number) => {
        page.drawText(line, { x: 55, y: y - 120 - (i * 16), size: 11, font: helveticaOblique, color: mutedText });
      });
      
      page.drawText(`DISC: ${result?.discStyle || "Balanced"}`, { x: 55, y: y - 165, size: 12, font: helvetica, color: mutedText });
      
      y -= 200;
      
      page.drawRectangle({ x: 40, y: y - 180, width: width - 80, height: 170, color: cardBg, borderColor: purple, borderWidth: 1 });
      
      page.drawText("BIG FIVE PERSONALITY PROFILE", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      
      const bigFive = result?.bigFiveProfile || { O: 50, C: 50, E: 50, A: 50, N: 50 };
      const traits = [
        { name: "Openness", key: "O", value: bigFive.O, desc: "Creativity & Curiosity" },
        { name: "Conscientiousness", key: "C", value: bigFive.C, desc: "Organization & Discipline" },
        { name: "Extraversion", key: "E", value: bigFive.E, desc: "Social Energy" },
        { name: "Agreeableness", key: "A", value: bigFive.A, desc: "Empathy & Cooperation" },
        { name: "Neuroticism", key: "N", value: bigFive.N, desc: "Emotional Sensitivity" },
      ];
      
      let traitY = y - 50;
      for (const trait of traits) {
        page.drawText(trait.name, { x: 55, y: traitY, size: 10, font: helveticaBold, color: lightText });
        page.drawText(trait.desc, { x: 180, y: traitY, size: 8, font: helvetica, color: mutedText });
        
        page.drawRectangle({ x: 340, y: traitY - 2, width: 160, height: 12, color: rgb(0.15, 0.15, 0.2) });
        page.drawRectangle({ x: 340, y: traitY - 2, width: Math.min(trait.value * 1.6, 160), height: 12, color: purple });
        
        page.drawText(`${trait.value}%`, { x: 510, y: traitY, size: 10, font: helveticaBold, color: lightText });
        
        traitY -= 26;
      }
      
      y -= 200;
      
      page.drawRectangle({ x: 40, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
      page.drawText("MOOD BLEND", { x: 55, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      const moodText = mood || "Balanced";
      page.drawText(moodText.length > 25 ? moodText.slice(0, 25) + "..." : moodText, { x: 55, y: y - 55, size: 14, font: helveticaBold, color: lightText });
      page.drawText("Your emotional starting point", { x: 55, y: y - 75, size: 9, font: helvetica, color: mutedText });
      
      page.drawRectangle({ x: 40 + (width - 90) / 2 + 10, y: y - 100, width: (width - 90) / 2, height: 90, color: cardBg, borderColor: purple, borderWidth: 1 });
      page.drawText("AGE TIER", { x: 55 + (width - 90) / 2 + 10, y: y - 25, size: 10, font: helveticaBold, color: cyan });
      page.drawText(tier || "Adult", { x: 55 + (width - 90) / 2 + 10, y: y - 55, size: 14, font: helveticaBold, color: lightText });
      page.drawText("Quiz difficulty level", { x: 55 + (width - 90) / 2 + 10, y: y - 75, size: 9, font: helvetica, color: mutedText });
      
      y -= 120;
      
      page.drawRectangle({ x: 40, y: 30, width: width - 80, height: 50, color: cardBg });
      page.drawText("Generated by KnowYouRole", { x: 55, y: 55, size: 10, font: helvetica, color: mutedText });
      page.drawText("knowyourole.replit.app", { x: 55, y: 40, size: 9, font: helvetica, color: purple });
      page.drawText(`Session: ${sessionId?.slice(-8) || "N/A"}`, { x: width - 160, y: 48, size: 9, font: helvetica, color: mutedText });
      
      const pdfBytes = await pdfDoc.save();
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=KnowYouRole-Results.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  app.post("/api/admin/seed", async (_req: Request, res: Response) => {
    try {
      await seedAll();
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });
}
