import dotenv from "dotenv";
import { runApp, closeApp } from "./app.js";
import { db } from "./helpers/databse.js";

(async () => {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({
      path: "src/dev.env",
    });
  }

  await db.connect();

  const app = runApp();

  closeApp(app);

  const port = process.env.PORT || 4000;
  const server = app.listen(port, (err) => {
    if (err) {
      console.log(`[server] could not start http server on port: ${port}`);
      return;
    }
    console.log(`[server] running on port: ${port}`);
  });
  // Handling Uncaught Exception
  process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`[server] shutting down due to Uncaught Exception`);

    server.close(() => {
      process.exit(1);
    });
  });

  // Unhandled Promise Rejection
  process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err}`);
    console.log(`[server] shutting down due to Unhandled Promise Rejection`);

    server.close(() => {
      process.exit(1);
    });
  });
})();
