import express, { type Application, type Router } from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export interface RouteDefinition {
  path: string;
  router: Router;
}

interface AppOptions {
  corsOrigin: string | string[];
  routes: RouteDefinition[];
}

// Builds the Express app. It does not create dependencies: main.ts injects the routers.
export const createApp = ({ corsOrigin, routes }: AppOptions): Application => {
  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  for (const { path, router } of routes) {
    app.use(path, router);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
