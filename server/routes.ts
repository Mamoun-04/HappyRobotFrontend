import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy route to forward requests to external API and avoid CORS issues
  app.get("/api/logs", async (req, res) => {
    try {
      const response = await fetch("https://hrfde-2.fly.dev/api/logs");
      
      if (!response.ok) {
        return res.status(response.status).json({ 
          message: `External API error: ${response.status} ${response.statusText}` 
        });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching from external API:", error);
      res.status(500).json({ 
        message: "Failed to fetch data from external API" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
