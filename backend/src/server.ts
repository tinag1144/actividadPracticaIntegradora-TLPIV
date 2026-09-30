import "dotenv/config";
import app from "./app.js";
import { db } from "./config/database.js";

const port: number = Number(process.env.PORT);

const startServer = async (): Promise<void> => {
  await db.connect(process.env.MONGO_URI as string);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
