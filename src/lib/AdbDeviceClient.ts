import type { IAdbOptions } from "../types/adb/AdbOptions";
import { Adb } from "./Adb";

export class AdbDeviceClient extends Adb {
  deviceId: string;
  constructor(deviceId: string, opts?: IAdbOptions) {
    super({ ...opts, path: `${opts?.path || "adb"} -s ${deviceId}` });
    this.deviceId = deviceId;
  }

  async disconnect(): Promise<boolean> {
    const result = await this.exec("disconnect", [this.deviceId]);
    return !!result;
  }
}
