import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API proxy route to bypass CORS issues when fetching Blogger feed
  app.get("/api/posts", async (req, res) => {
    try {
      const response = await fetch("https://irreferencias.blogspot.com/feeds/posts/default?alt=json&max-results=500");
      if (!response.ok) {
        throw new Error(`Blogger API returned ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching Blogger feed:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
