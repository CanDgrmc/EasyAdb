import { spawn } from "child_process";
import Logger from "../utils/Logger";

export default async function testAdbConnection(
  adbPath: string,
  log: boolean = true
): Promise<boolean> {
  const logger = new Logger({
    silent: !log,
    prefix: "ADB",
  });
  return new Promise((resolve) => {
    logger.log("\n=== Testing ADB Connection ===");

    const adbProcess = spawn(adbPath, ["devices"]);
    let output = "";

    adbProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    adbProcess.stderr.on("data", (data) => {
      logger.error(`ADB Error: ${data.toString()}`);
    });

    adbProcess.on("close", (code) => {
      if (log) {
        logger.log(`ADB devices command exited with code ${code}`);
        logger.log("Output:", output);
      }

      if (code !== 0) {
        if (log) {
          logger.error(
            "❌ ADB command failed. Check if ADB is installed and in PATH."
          );
        }
        resolve(false);
        return;
      }

      if (!output.includes("device")) {
        if (log) {
          logger.error("❌ No device found or device not authorized.");
          logger.log(
            "Tip: Make sure your device is connected and you accepted the USB debugging prompt."
          );
        }

        resolve(false);
        return;
      }

      if (log) {
        logger.log("✅ ADB connection successful!");
      }
      resolve(true);
    });

    adbProcess.on("error", (err) => {
      if (log) {
        logger.error("❌ Error spawning ADB process:", err);
      }
      resolve(false);
    });
  });
}
