import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function resultsApiMiddleware(): Plugin {
  return {
    name: "local-results-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/results/")) {
          next();
          return;
        }

        try {
          const mod = await server.ssrLoadModule("/src/lib/results/viteResultsApiShim.ts");
          await mod.handleViteResultsApi(req, res);
        } catch (error) {
          console.error("[Vite Results API] middleware failed", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Vite results API middleware failed",
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv("production", process.cwd(), ""),
    ...loadEnv(mode, process.cwd(), ""),
  };

  // Vite middleware runs in Node, while existing Supabase helpers read process.env.
  // Populate missing process env vars locally without changing browser exposure rules.
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), resultsApiMiddleware()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@shared": path.resolve(import.meta.dirname, "src/lib"),
      },
    },
    server: {
      port: 5173,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    // Local middleware handles /api/results/* for pure Vite dev.
    // Other API calls remain unchanged/backward-compatible.
  };
});
