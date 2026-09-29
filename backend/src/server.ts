import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const port: number = Number(process.env.PORT);

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();
