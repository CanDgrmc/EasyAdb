import { type ChildProcessWithoutNullStreams, spawn } from "child_process";
import type internal from "stream";
import { Transform } from "stream";
import type { IAdbOptions, IAdbOutputOptions } from "../types/adb/AdbOptions";
import Logger from "../utils/Logger";
import { executePromiseWithTimeout } from "../utils/Timeout";

const DEFAULT_OUTPUT_OPTIONS: IAdbOutputOptions = {
  hasVerbose: false,
  noThrow: false,
};

const DEFAULT_ADB_OPTIONS: IAdbOptions = {
  path: "adb",
  timeout: 10000,
};

export class Adb {
  ADB_PATH = DEFAULT_ADB_OPTIONS.path || "adb";
  TIMEOUT = DEFAULT_ADB_OPTIONS.timeout || 10000;
  private outputOptions: IAdbOutputOptions = DEFAULT_OUTPUT_OPTIONS;

  constructor(opts?: IAdbOptions) {
    if (opts?.path) {
      this.ADB_PATH = opts.path;
    }
    if (opts?.host) {
      this.ADB_PATH = `${this.ADB_PATH} -H ${opts.host}`;
    }
    if (opts?.port) {
      this.ADB_PATH = `${this.ADB_PATH} -P ${opts.port}`;
    }
    if (opts?.timeout) {
      this.TIMEOUT = opts.timeout;
    }
  }

  verbose(): this {
    this.outputOptions.hasVerbose = true;
    return this;
  }

  noThrow(): this {
    this.outputOptions.noThrow = true;
    return this;
  }

  async shell(command: string): Promise<string | null> {
    return await this.exec(`shell ${command}`);
  }

  async reboot(): Promise<void> {
    await this.exec(`reboot`);
  }

  async uninstall(packagename: string): Promise<void> {
    if (!packagename) throw new Error("package name is required");
    await this.exec(`uninstall ${packagename}`);
  }

  async exec(command: string, args?: string[]): Promise<string | null> {
    try {
      const result = await this.executeCommand(command, args);
      return result;
    } catch (error) {
      if (!this.outputOptions.noThrow) {
        throw error;
      }
      return null;
    } finally {
      this.outputOptions = DEFAULT_OUTPUT_OPTIONS;
    }
  }

  async resolveStream(stream: ChildProcessWithoutNullStreams): Promise<string> {
    const logger = new Logger({
      silent: !this.outputOptions.hasVerbose,
      prefix: "ADB",
    });

    try {
      const result: string = await executePromiseWithTimeout(
        this.TIMEOUT,
        new Promise((resolve, reject) => {
          let stdout = "";

          stream.stdout.on("data", (data) => {
            stdout += data.toString();
          });

          stream.stderr.on("data", (data) => {
            if (stream.spawnargs.length > 1) {
              stdout += data.toString();
            }
          });

          stream.on("close", (code) => {
            if (code !== 0) {
              logger.warn(`command exited with code ${code}: ${stdout}`);
              reject(new Error(`command failed with code ${code}: ${stdout}`));
            } else {
              logger.log(
                `command exited with code ${code}: ${stdout} ${stdout}`
              );
              resolve(stdout);
            }
          });

          stream.on("error", (err: Error) => {
            logger.error("Failed to execute command:", err);
            reject(err);
          });
        })
      );

      return result;
    } catch (error) {
      stream?.disconnect();
      throw error;
    }
  }

  private async executeCommand(
    command: string,
    args?: string[]
  ): Promise<string> {
    const logger = new Logger({
      silent: !this.outputOptions.hasVerbose,
      prefix: "ADB",
    });

    const fullArgs = [command, ...(args || [])];
    logger.log(`Executing command: adb ${fullArgs.join(" ")}`);

    const adbProcess: ChildProcessWithoutNullStreams = spawn(
      this.ADB_PATH,
      fullArgs,
      { shell: true }
    );

    const result = await this.resolveStream(adbProcess);
    return result;
  }

  async startServer(): Promise<boolean> {
    const isStarted = await this.exec("start-server");
    return !!isStarted;
  }

  async push(
    stream: internal.Readable,
    remotePath: string,
    onProgress?: (transferred: number, total?: number) => void
  ): Promise<string> {
    const adbProcess: ChildProcessWithoutNullStreams = spawn(this.ADB_PATH, [
      "push",
      remotePath,
    ]);

    let totalSize: number | undefined;
    if ("size" in stream && typeof stream.size === "number") {
      totalSize = stream.size;
    }

    let bytesTransferred = 0;

    const progressTracker = new Transform({
      transform(chunk, encoding, callback) {
        bytesTransferred += chunk.length;

        if (onProgress) {
          onProgress(bytesTransferred, totalSize);
        }

        callback(null, chunk);
      },
    });

    stream.pipe(progressTracker).pipe(adbProcess.stdin);

    const result = await this.resolveStream(adbProcess);
    return result;
  }

  async pull(path: string, to: string): Promise<void> {
    this.exec("pull", [path, to]);
  }

  async install(remotePath: string): Promise<string | null> {
    const result = await this.exec("install", [remotePath]);

    return result;
  }

  logcat(onLog?: (log: string) => void): ChildProcessWithoutNullStreams {
    const adbProcess: ChildProcessWithoutNullStreams = spawn(
      this.ADB_PATH,
      ["logcat"],
      { shell: true }
    );
    adbProcess.stdout.on("data", (data) => {
      if (onLog) {
        onLog(data.toString());
      }
    });

    return adbProcess;
  }
}
