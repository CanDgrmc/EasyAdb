import type { IAdbClient } from "../types/adb/Adb";
import { Adb } from "./Adb";
import { AdbDeviceClient } from "./AdbDeviceClient";
import { DeviceClient } from "./DeviceClient";

export class AdbClient extends Adb implements IAdbClient {
  async connect(deviceIp?: string): Promise<boolean> {
    let result;
    if (deviceIp) {
      result = await this.exec("connect", [deviceIp]);
    } else {
      result = await this.exec("connect");
    }

    return !!result;
  }

  async disconnect(deviceIp: string): Promise<boolean> {
    const result = await this.exec("disconnect", [deviceIp]);
    return !!result;
  }

  async getDevices(): Promise<DeviceClient[]> {
    const devices = await this.exec("devices");
    if (!devices) {
      return [];
    }

    const devicesList = devices.split("\n").slice(1);
    const devicesMap = devicesList.filter(i => i.length > 2).map((device) => {
      const [serial, _, ...rest] = device.split("\t").filter(Boolean);
      const model = rest.join(" ");
      const adbDeviceClient = new AdbDeviceClient(serial, {
        path: this.ADB_PATH,
        timeout: this.TIMEOUT,
      });
      const deviceClient = new DeviceClient(adbDeviceClient);
      return deviceClient;
    });
    return devicesMap;
  }

  async getDevice(deviceId: string): Promise<DeviceClient> {
    const devices = await this.getDevices();
    const device = devices.find(
      (device) => device.getDeviceId() === `${deviceId}`
    );

    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const adbDeviceClient = new AdbDeviceClient(deviceId, {
      path: this.ADB_PATH,
      timeout: this.TIMEOUT,
    });

    const deviceClient = new DeviceClient(adbDeviceClient);
    return deviceClient;
  }
}
