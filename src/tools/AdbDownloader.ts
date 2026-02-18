import https from "https";
import { createWriteStream, mkdirSync, existsSync } from "fs";
import { extract } from "tar";
import { createReadStream, unlinkSync } from "fs";
import { platform, arch } from "os";
import { join } from "path";
import { execSync } from "child_process";
import Logger from "../utils/Logger";

export interface IAdbDownloadOptions {
  destinationPath?: string;
  version?: string;
  verbose?: boolean;
  onProgress?: (downloaded: number, total: number) => void;
}

const PLATFORM_MAPPING: Record<
  string,
  Record<string, { url: string; folder: string }>
> = {
  linux: {
    x64: {
      url: "https://dl.google.com/android/repository/platform-tools-latest-linux.zip",
      folder: "platform-tools",
    },
    arm64: {
      url: "https://dl.google.com/android/repository/platform-tools-latest-linux.zip",
      folder: "platform-tools",
    },
  },
  darwin: {
    x64: {
      url: "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip",
      folder: "platform-tools",
    },
    arm64: {
      url: "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip",
      folder: "platform-tools",
    },
  },
  win32: {
    x64: {
      url: "https://dl.google.com/android/repository/platform-tools-latest-windows.zip",
      folder: "platform-tools",
    },
    x32: {
      url: "https://dl.google.com/android/repository/platform-tools-latest-windows.zip",
      folder: "platform-tools",
    },
  },
};

export async function downloadAdb(
  options: IAdbDownloadOptions = {}
): Promise<string> {
  const {
    destinationPath = join(process.cwd(), ".adb"),
    verbose = false,
    onProgress,
  } = options;

  const logger = new Logger({
    silent: !verbose,
    prefix: "AdbDownloader",
  });

  try {
    const currentPlatform = platform();
    const currentArch = arch();

    logger.log(
      `Detected platform: ${currentPlatform}, arch: ${currentArch}`
    );

    const platformConfig = PLATFORM_MAPPING[currentPlatform];
    if (!platformConfig) {
      throw new Error(
        `Unsupported platform: ${currentPlatform}. Supported platforms: linux, darwin, win32`
      );
    }

    const archConfig = platformConfig[currentArch];
    if (!archConfig) {
      throw new Error(
        `Unsupported architecture: ${currentArch} on ${currentPlatform}`
      );
    }

    const { url, folder } = archConfig;
    logger.log(`Downloading ADB from: ${url}`);

    // Create destination directory if it doesn't exist
    if (!existsSync(destinationPath)) {
      mkdirSync(destinationPath, { recursive: true });
    }

    // Download the file
    const downloadPath = await downloadFile(url, destinationPath, onProgress);
    logger.log(`Downloaded to: ${downloadPath}`);

    // Extract the file
    logger.log("Extracting archive...");
    const adbPath = await extractArchive(downloadPath, destinationPath, folder);
    logger.log(`ADB extracted to: ${adbPath}`);

    // Clean up the downloaded file
    unlinkSync(downloadPath);
    logger.log("Cleanup complete");

    return adbPath;
  } catch (error) {
    logger.error("Failed to download ADB:", error);
    throw error;
  }
}

async function downloadFile(
  url: string,
  destinationPath: string,
  onProgress?: (downloaded: number, total: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = url.split("/").pop() || "adb.zip";
    const filePath = join(destinationPath, fileName);

    const file = createWriteStream(filePath);
    let downloadedBytes = 0;

    https
      .get(url, { timeout: 30000 }, (response) => {
        const totalBytes = parseInt(
          response.headers["content-length"] || "0",
          10
        );

        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;
          if (onProgress && totalBytes > 0) {
            onProgress(downloadedBytes, totalBytes);
          }
        });

        response.pipe(file);
      })
      .on("error", (error) => {
        file.destroy();
        unlinkSync(filePath);
        reject(new Error(`Failed to download file: ${error.message}`));
      });

    file.on("finish", () => {
      file.close();
      resolve(filePath);
    });

    file.on("error", (error) => {
      unlinkSync(filePath);
      reject(new Error(`Failed to write file: ${error.message}`));
    });
  });
}

async function extractArchive(
  archivePath: string,
  destinationPath: string,
  extractFolder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // For .zip files, we need to use a different approach
    // since tar.extract is for tar files
    if (archivePath.endsWith(".zip")) {
      extractZip(archivePath, destinationPath)
        .then(() => {
          const adbPath = join(destinationPath, extractFolder);
          resolve(adbPath);
        })
        .catch(reject);
    } else {
      // For tar files
      createReadStream(archivePath)
        .pipe(
          extract({
            cwd: destinationPath,
          })
        )
        .on("finish", () => {
          const adbPath = join(destinationPath, extractFolder);
          resolve(adbPath);
        })
        .on("error", reject);
    }
  });
}

async function extractZip(
  zipPath: string,
  destinationPath: string
): Promise<void> {
  // Dynamically require unzipper to handle zip extraction
  try {
    const unzipper = await import("unzipper");
    return new Promise((resolve, reject) => {
      createReadStream(zipPath)
        .pipe(unzipper.default.Extract({ path: destinationPath }))
        .on("close", () => resolve())
        .on("error", reject);
    });
  } catch (error) {
    throw new Error(
      `Failed to extract zip file. Make sure 'unzipper' is installed: ${error}`
    );
  }
}

export async function checkAdbExists(adbPath: string = "adb"): Promise<boolean> {
  try {
    // Check if it's an absolute path
    if (adbPath.startsWith("/") || adbPath.startsWith("\\") || adbPath.includes(":")) {
      return existsSync(adbPath);
    }

    // Otherwise, check if it's in PATH
    try {
      const command = platform() === "win32" ? `where ${adbPath}` : `which ${adbPath}`;
      execSync(command, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export default downloadAdb;
