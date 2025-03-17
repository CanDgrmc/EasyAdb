export { Adb } from "./lib/Adb";
export { AdbClient } from "./lib/AdbClient";
export { DeviceClient } from "./lib/DeviceClient";

export { parseProperty } from "./utils/StrHelper";

import type { IAdbClient } from "./types/adb/Adb";
import type { IAdbDevice } from "./types/adb/AdbDevice";
import type { IAdbOptions, IAdbOutputOptions } from "./types/adb/AdbOptions";

export type * as DeviceProps from "./types/device/DeviceProps";

export type AdbTypes = {
  IAdbClient: IAdbClient;
  IAdbDevice: IAdbDevice;
  IAdbOptions: IAdbOptions;
  IAdbOutputOptions: IAdbOutputOptions;
};
