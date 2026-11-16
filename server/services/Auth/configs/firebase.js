import { cert, initializeApp, getApps } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFirebaseCredential = () => {
  // 1. Direct environment variable (Raw JSON or Base64 string for AWS ECS / EC2 SSM)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      const jsonStr = raw.startsWith("{")
        ? raw
        : Buffer.from(raw, "base64").toString("utf-8");
      return cert(JSON.parse(jsonStr));
    } catch (e) {
      console.error(
        "Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:",
        e.message,
      );
    }
  }

  // 2. Secret file path or default local firebaseService.json
  const targetPath =
    process.env.FIREBASE_CONFIG_PATH ||
    path.resolve(__dirname, "../firebaseService.json");

  if (fs.existsSync(targetPath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      return cert(fileData);
    } catch (e) {
      console.error("Failed to read firebaseService.json file:", e.message);
    }
  }

  console.warn(
    "Warning: No valid Firebase credentials found via FIREBASE_SERVICE_ACCOUNT or firebaseService.json.",
  );
  return undefined;
};

const credential = getFirebaseCredential();

export const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(credential ? { credential } : {});

