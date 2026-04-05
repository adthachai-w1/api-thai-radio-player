import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for current track (RadioBOSS data)
  let currentTrack = {
    title: "Live Stream",
    artist: "PRD Radio",
    nowplaying: "PRD Radio - Live Stream",
    timestamp: Date.now()
  };

  // API for RadioBOSS to PUSH updates
  // RadioBOSS can be configured to call: http://your-app/api/update?artist=%artist%&title=%title%
  app.all("/api/update", (req, res) => {
    const { artist, title, nowplaying } = { ...req.query, ...req.body } as any;
    
    if (artist || title || nowplaying) {
      currentTrack = {
        artist: artist || "Unknown Artist",
        title: title || "Unknown Track",
        nowplaying: nowplaying || `${artist} - ${title}`,
        timestamp: Date.now()
      };
      console.log("Track updated:", currentTrack);
    }
    
    res.json({ status: "ok", received: currentTrack });
  });

  // API for Frontend to GET current track
  app.get("/api/nowplaying", (req, res) => {
    res.json(currentTrack);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
