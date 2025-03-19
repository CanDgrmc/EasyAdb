import fs, { ReadStream } from "fs";
import type {
  CacheEntry,
  DeviceControlKeyCodeInputs,
  DeviceControlSwipeInputs,
  DeviceControlTapInputs,
  DeviceControlTextInputs,
  DeviceMemory,
  StorageInfo,
} from "../types/device/DeviceProps";
import { parseProperty } from "../utils/StrHelper";
import type { AdbDeviceClient } from "./AdbDeviceClient";

const COMMANDS = Object.freeze({
  deviceName: "getprop ro.product.name",
  resolution: "wm size",
  androidVersion: "getprop ro.build.version.release",
  model: "getprop ro.product.model",
  manufacturer: "getprop ro.product.manufacturer",
  brand: "getprop ro.product.brand",
  SDKVersion: "getprop ro.build.version.sdk",
  density: "getprop ro.sf.lcd_density",
  language: "getprop persist.sys.language",
  locale: "getprop persist.sys.locale",
  deviceProps: "getprop",
  memory: "cat /proc/meminfo",
  storage: "df /data",
  disableLauncher: "pm disable com.android.launcher3",
  enableLauncher: "pm enable com.android.launcher3",
  enableSystemUI: "pm enable com.android.systemui",
  disableSystemUI: "pm disable com.android.systemui",
  screenState: 'dumpsys power | grep "Display Power" | grep -oE "(ON|OFF)"',
  toggleScreen: "input keyevent 26",
  setHomeApp: "cmd package set-home-activity",
  setSharedPref: `'am broadcast -a $app.sp.PUT --es key $key --es value $val'`,
  removeSharedPref: `'am broadcast -a $app.sp.CLEAR --es key $key --es value $val'`,
  getSharedPref: `'am broadcast -a $app.sp.GET --es key $key'`,
  getSharedPrefAll: `'am broadcast -a $app.sp.GETALL'`,
  getSharedPrefClear: `'am broadcast -a $app.sp.CLEARALL'`,
  getSharedPrefClearAll: `'am broadcast -a $app.sp.CLEARALL'`,
  controls: {
    tap: `input tap $deviceX $deviceY`,
    swipe: `input swipe $deviceX1 $deviceY1 $deviceX2 $deviceY2`,
    text: `input text '$text'`,
    key: `input keyevent $keycode`,
  },
});

export class DeviceClient {
  private deviceClient: AdbDeviceClient;
  private id: string;
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(deviceClient: AdbDeviceClient) {
    this.deviceClient = deviceClient;
    this.id = deviceClient.deviceId;
    this.cache = new Map<string, CacheEntry<any>>();
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value as T;
    }
    return null;
  }

  private setCached(key: string, value: any): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  public async getName(): Promise<string | null> {
    const cached = this.getCached<string>("name");
    if (cached) return cached;

    const result = await this.deviceClient.shell(COMMANDS.deviceName);
    if (result) {
      this.setCached("name", result);
    }
    return result;
  }

  public async getDeviceMemory(): Promise<DeviceMemory | null> {
    const cached = this.getCached<DeviceMemory>("memory");
    if (cached) return cached;

    const result = await this.deviceClient.shell(COMMANDS.memory);
    if (!result) {
      return null;
    }
    const parseMemValue = (pattern: string): number => {
      const match = result.match(new RegExp(`${pattern}:\\s+(\\d+)\\s+kB`));
      return match ? parseInt(match[1], 10) : 0;
    };

    const totalMemory = parseMemValue("MemTotal");
    const memFree = parseMemValue("MemFree");
    const memoryInfo = {
      totalMemory,
      memFree,
      memUsed: totalMemory - memFree,
    };

    this.setCached("memory", memoryInfo);
    return memoryInfo;
  }

  public async getStorage(): Promise<StorageInfo[] | null> {
    const cached = this.getCached<StorageInfo[]>("storage");
    if (cached) return cached;

    const result = await this.deviceClient.shell(COMMANDS.storage);
    if (!result) {
      return null;
    }
    const storage = result
      .split("\n")
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const [Path, kBlock, Used, Available, UsePercentage, MountedOn] = line
          .split(/\s+/)
          .filter(Boolean);
        return {
          Path,
          kBlock,
          Used: parseInt(Used, 10),
          Available: parseInt(Available, 10),
          UsePercentage,
          MountedOn,
        };
      });

    this.setCached("storage", storage);
    return storage;
  }

  public async getAllProps(
    props?: string[]
  ): Promise<string | { [key: string]: string } | null> {
    const getProps = (p: string): string | { [key: string]: string } | null => {
      if (!props) return p;
      const result: { [key: string]: string } = {};
      for (let prop of props) {
        result[prop] = parseProperty(p, prop);
      }
      return result;
    };
    const cached = this.getCached<string>("props");
    if (cached) return getProps(cached);

    const result = await this.deviceClient.shell(COMMANDS.deviceProps);
    if (result) {
      this.setCached("props", result);
      return getProps(result);
    }
    return result;
  }

  public getDeviceId(): string {
    return this.id;
  }

  public async getAndroidVersion(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.androidVersion);
  }

  public async getScreenState(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.screenState);
  }

  public async getScreenResolution(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.resolution);
  }

  public async getManufacturer(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.manufacturer);
  }

  public async getBrand(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.brand);
  }

  public async getSDKVersion(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.SDKVersion);
  }

  public async getScreenDensity(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.density);
  }

  public async getSystemLanguage(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.language);
  }

  public async getLocale(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.locale);
  }

  public async getModel(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.model);
  }

  public async disableLauncher(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.disableLauncher);
  }

  public async enableLauncher(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.enableLauncher);
  }

  public async enableSystemUI(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.enableSystemUI);
  }

  public async disableSystemUI(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.disableSystemUI);
  }

  public async pull(path: string, to: string): Promise<void> {
    return this.deviceClient.pull(path, to);
  }

  public async push(
    path: string | ReadStream,
    remotePath: string,
    onProgress?: (transferred: number, total?: number) => void
  ): Promise<boolean> {
    if (typeof path === "string" && !fs.existsSync(path)) {
      throw new Error(`File ${path} does not exist`);
    }
    const stream = typeof path === "string" ? fs.createReadStream(path) : path;
    const installed = await this.deviceClient.push(
      stream,
      remotePath,
      onProgress
    );
    return !!installed;
  }

  public async toggleScreen(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.toggleScreen);
  }

  public async setHomeApp(app: string): Promise<string | null> {
    return this.deviceClient.shell(`${COMMANDS.setHomeApp} ${app}`);
  }

  public async clearCache(app: string): Promise<string | null> {
    return this.deviceClient.shell(`pm clear ${app}`);
  }

  public async ls(path?: string): Promise<string[]> {
    const paths = await this.deviceClient.shell(`ls ${path || "/"}`);
    if (!paths) return [];
    return paths.split("\n");
  }

  public async reboot(): Promise<void> {
    await this.deviceClient.reboot();
  }

  public async uninstall(packagename: string): Promise<void> {
    await this.deviceClient.uninstall(packagename);
  }

  public async putSharedConfig(
    fullAppName: string,
    key: string,
    value: any,
    props: {
      restart: boolean;
    }
  ): Promise<void> {
    let command = COMMANDS.setSharedPref
      .replace("$app", fullAppName)
      .replace("$key", key)
      .replace("$val", typeof value === "string" ? `"${value}"` : value);
    if (props.restart) {
      command += " --ez retart true";
    }
    await this.deviceClient.shell(command);
  }

  public async removeSharedConfig(
    fullAppName: string,
    key: string,
    value: any,
    props: {
      restart: boolean;
    }
  ): Promise<void> {
    let command = COMMANDS.removeSharedPref
      .replace("$app", fullAppName)
      .replace("$key", key)
      .replace("$val", typeof value === "string" ? `"${value}"` : value);
    if (props.restart) {
      command += " --ez retart true";
    }
    await this.deviceClient.shell(command);
  }

  public async getSharedConfig(
    fullAppName: string,
    key: string
  ): Promise<string | null> {
    const command = COMMANDS.getSharedPref
      .replace("$app", fullAppName)
      .replace("$key", key);
    return this.deviceClient.shell(command);
  }
  public async getAllSharedConfig(fullAppName: string): Promise<string | null> {
    const command = COMMANDS.getSharedPrefAll.replace("$app", fullAppName);
    return this.deviceClient.shell(command);
  }
  public async clearAllSharedConfig(
    fullAppName: string
  ): Promise<string | null> {
    const command = COMMANDS.getSharedPrefClearAll.replace("$app", fullAppName);
    return this.deviceClient.shell(command);
  }
  public async clearSharedConfig(
    fullAppName: string,
    key: string
  ): Promise<string | null> {
    const command = COMMANDS.getSharedPrefClear
      .replace("$app", fullAppName)
      .replace("$key", key);
    return this.deviceClient.shell(command);
  }

  /**
   * Controls device interactions through various input methods.
   *
   * @async
   * @param {string} action - Type of control action to perform: "tap", "swipe", "text", or "key".
   * @param {DeviceControlTapInputs|DeviceControlSwipeInputs|DeviceControlTextInputs|DeviceControlKeyCodeInputs} data - Parameters for the specified action.
   * @param {DeviceControlTapInputs} data - For "tap" action: contains x, y coordinates and scaling factors.
   * @param {DeviceControlSwipeInputs} data - For "swipe" action: contains start/end coordinates, scaling factors and duration.
   * @param {DeviceControlTextInputs} data - For "text" action: contains text to input.
   * @param {DeviceControlKeyCodeInputs} data - For "key" action: contains keycode to press.
   * @returns {Promise<void>} - Promise that resolves when the control action completes.
   *
   * @see {@link https://developer.android.com/reference/android/view/KeyEvent} for keycode reference documentation.
   *
   * @example
   * // Tap at position (100, 200) with scaling
   * await control("tap", { x: 100, y: 200, scaleX: 1.5, scaleY: 1.5 });
   *
   * // Swipe from (100, 200) to (300, 400)
   * await control("swipe", {
   *   x: 100, y: 200, x2: 300, y2: 400,
   *   scaleX: 1.0, scaleY: 1.0, duration: 300
   * });
   *
   * // Input text
   * await control("text", { text: "Hello world" });
   *
   * // Press a key by keycode
   * await control("key", { keycode: "4" });
   */
  public async control(
    action: "tap" | "swipe" | "text" | "key",
    data:
      | DeviceControlTapInputs
      | DeviceControlTextInputs
      | DeviceControlKeyCodeInputs
      | DeviceControlSwipeInputs
  ) {
    switch (action) {
      case "tap":
        const tapActionInput: DeviceControlTapInputs =
          data as DeviceControlTapInputs;
        await this.deviceClient.shell(
          COMMANDS.controls.tap
            .replace("$deviceX", `${tapActionInput.x * tapActionInput.scaleX}`)
            .replace("$deviceY", `${tapActionInput.y * tapActionInput.scaleY}`)
        );
        break;
      case "swipe":
        const swipeActionInput: DeviceControlSwipeInputs =
          data as DeviceControlSwipeInputs;
        await this.deviceClient.shell(
          COMMANDS.controls.swipe
            .replace(
              "$deviceX1",
              `${Math.round(swipeActionInput.x * swipeActionInput.scaleX)}`
            )
            .replace(
              "$deviceY1",
              `${Math.round(swipeActionInput.y * swipeActionInput.scaleY)}`
            )
            .replace(
              "$deviceX2",
              `${Math.round(swipeActionInput.x2 * swipeActionInput.scaleX)}`
            )
            .replace(
              "$deviceY2",
              `${Math.round(swipeActionInput.y2 * swipeActionInput.scaleY)}`
            )
        );
        break;
      case "text":
        const textActionInput: DeviceControlTextInputs =
          data as DeviceControlTextInputs;

        await this.deviceClient.shell(
          COMMANDS.controls.text.replace("$text", textActionInput.text)
        );
        break;
      case "key":
        const keyCodeActionInput: DeviceControlKeyCodeInputs =
          data as DeviceControlKeyCodeInputs;

        await this.deviceClient.shell(
          COMMANDS.controls.key.replace("$keycode", keyCodeActionInput.keycode)
        );
        break;
    }
  }
}
