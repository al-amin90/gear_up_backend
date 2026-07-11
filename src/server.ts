import app from "./app";
import config from "./app/config";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the Database successfully");

    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (err) {
    await prisma.$disconnect();
    console.log(err);
  }
}

main();

process.on("unhandledRejection", () => {
  console.log(`unhandledRejection is detected, shutting down...`);
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`unhandledRejection is detected, shutting down...`);
  process.exit(1);
});
