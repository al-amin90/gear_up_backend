import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  database_url: process.env.DATABASE_URL,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  app_url: process.env.APP_URL,

  access_token: process.env.JWT_ACCESS_TOKEN!,
  refresh_token: process.env.JWT_REFRESH_TOKEN!,
  access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,

  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
};
