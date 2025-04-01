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

  /**
   *
   * @param key
   * @returns
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value as T;
    }
    return null;
  }

  /**
   *
   * @param key
   * @param value
   */
  private setCached(key: string, value: any): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   *
   * @returns {string|null} device name
   */
  public async getName(): Promise<string | null> {
    const cached = this.getCached<string>("name");
    if (cached) return cached;

    const result = await this.deviceClient.shell(COMMANDS.deviceName);
    if (result) {
      this.setCached("name", result);
    }
    return result;
  }

  /**
   * Retrieves the device's memory information
   * @returns {Promise<DeviceMemory | null>} Object containing memory information:
   *   - totalMemory: Total memory in KB
   *   - memFree: Free memory in KB
   *   - memUsed: Used memory in KB
   * @returns {null} If unable to retrieve memory information
   */
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

  /**
   * Retrieves storage information for all mounted filesystems on the device
   * @returns {Promise<StorageInfo[] | null>} Array of storage information objects:
   *   - Path: Filesystem path
   *   - kBlock: Size in blocks
   *   - Used: Used space in bytes
   *   - Available: Available space in bytes
   *   - UsePercentage: Usage percentage
   *   - MountedOn: Mount point location
   * @returns {null} If unable to retrieve storage information
   */
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

  /**
   * Retrieves device properties
   * @param {string[]} [props] - Optional array of specific property names to retrieve
   * @returns {Promise<string | { [key: string]: string } | null>}
   *   - If props parameter is provided: Object with requested property key-value pairs
   *   - If props parameter is not provided: Raw string containing all properties
   *   - null if unable to retrieve properties
   * @example
   * // Get all properties
   * const allProps = await getAllProps();
   *
   * // Get specific properties
   * const specificProps = await getAllProps(['ro.product.model', 'ro.build.version.sdk']);
   */
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

  /**
   * Returns the unique identifier of the connected device
   * @returns {string} The device ID
   */
  public getDeviceId(): string {
    return this.id;
  }

  /**
   *
   * @returns {string|null} device name
   */
  /**
   * Retrieves the name of the connected Android device
   * @returns {Promise<string | null>} The device name if available, null otherwise
   */
  public async getDeviceName(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.deviceName);
  }

  /**
   * Gets the Android OS version of the connected device
   * @returns {Promise<string | null>} The Android version if available, null otherwise
   */
  public async getAndroidVersion(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.androidVersion);
  }

  /**
   * Checks the current state of the device's screen
   * @returns {Promise<string | null>} The screen state if available, null otherwise
   */
  public async getScreenState(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.screenState);
  }

  /**
   * Retrieves the screen resolution of the connected device
   * @returns {Promise<string | null>} The screen resolution if available, null otherwise
   */
  public async getScreenResolution(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.resolution);
  }

  /**
   * Gets the manufacturer name of the connected device
   * @returns {Promise<string | null>} The manufacturer name if available, null otherwise
   */
  public async getManufacturer(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.manufacturer);
  }

  /**
   * Retrieves the brand name of the connected device
   * @returns {Promise<string | null>} The brand name if available, null otherwise
   */
  public async getBrand(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.brand);
  }

  /**
   * Retrieves the SDK version of the connected device
   * @returns {Promise<string | null>} The SDK version if available, null otherwise
   */
  public async getSDKVersion(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.SDKVersion);
  }

  /**
   * Gets the screen density of the connected device
   * @returns {Promise<string | null>} The screen density if available, null otherwise
   */
  public async getScreenDensity(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.density);
  }

  /**
   * Retrieves the system language setting of the device
   * @returns {Promise<string | null>} The system language if available, null otherwise
   */
  public async getSystemLanguage(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.language);
  }

  /**
   * Gets the locale settings of the device
   * @returns {Promise<string | null>} The locale if available, null otherwise
   */
  public async getLocale(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.locale);
  }

  /**
   * Retrieves the model name of the connected device
   * @returns {Promise<string | null>} The device model if available, null otherwise
   */
  public async getModel(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.model);
  }

  /**
   * Disables the launcher on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  public async disableLauncher(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.disableLauncher);
  }

  /**
   * Enables the launcher on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  public async enableLauncher(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.enableLauncher);
  }

  /**
   * Enables the system UI on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  public async enableSystemUI(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.enableSystemUI);
  }

  /**
   * Disables the system UI on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  public async disableSystemUI(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.disableSystemUI);
  }

  /**
   * Pulls a file from the device to the local system
   * @param {string} path - The path of the file on the device
   * @param {string} to - The destination path on the local system
   * @returns {Promise<void>}
   */
  public async pull(path: string, to: string): Promise<void> {
    return this.deviceClient.pull(path, to);
  }

  /**
   * Pushes a file or stream to the device
   * @param {string | ReadStream} path - The local file path or ReadStream to push
   * @param {string} remotePath - The destination path on the device
   * @param {Function} [onProgress] - Optional callback for progress updates
   * @param {number} onProgress.transferred - The number of bytes transferred
   * @param {number} [onProgress.total] - The total number of bytes to transfer
   * @returns {Promise<boolean>} True if the file was successfully installed
   * @throws {Error} If the local file path doesn't exist
   */
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

  /**
   * Toggles the device's screen state (on/off)
   * @returns {Promise<string | null>} Result of the screen toggle operation
   */
  public async toggleScreen(): Promise<string | null> {
    return this.deviceClient.shell(COMMANDS.toggleScreen);
  }

  /**
   * Sets the default home application (launcher)
   * @param {string} app - Package name of the app to set as home
   * @returns {Promise<string | null>} Result of the operation
   */
  public async setHomeApp(app: string): Promise<string | null> {
    return this.deviceClient.shell(`${COMMANDS.setHomeApp} ${app}`);
  }

  /**
   * Clears the cache of a specified application
   * @param {string} app - Package name of the app to clear cache
   * @returns {Promise<string | null>} Result of the cache clearing operation
   */
  public async clearCache(app: string): Promise<string | null> {
    return this.deviceClient.shell(`pm clear ${app}`);
  }

  /**
   * Lists files and directories in the specified path on the device
   * @param {string} [path="/"] - Directory path to list contents from
   * @returns {Promise<string[]>} Array of file/directory names
   */
  public async ls(path?: string): Promise<string[]> {
    const paths = await this.deviceClient.shell(`ls ${path || "/"}`);
    if (!paths) return [];
    return paths.split("\n");
  }

  /**
   * Reboots the device
   * @returns {Promise<void>}
   */
  public async reboot(): Promise<void> {
    await this.deviceClient.reboot();
  }

  /**
   * Uninstalls an application from the device
   * @param {string} packagename - Package name of the app to uninstall
   * @returns {Promise<void>}
   */
  public async uninstall(packagename: string): Promise<void> {
    await this.deviceClient.uninstall(packagename);
  }

  /**
   * Sets a shared preference configuration value for an application
   * @param {string} fullAppName - Full package name of the application
   * @param {string} key - Preference key to set
   * @param {any} value - Value to set for the preference
   * @param {Object} props - Additional properties
   * @param {boolean} props.restart - Whether to restart the app after setting
   * @returns {Promise<void>}
   */
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

  /**
   * Removes a shared preference configuration value from an application
   * @param {string} fullAppName - Full package name of the application
   * @param {string} key - Preference key to remove
   * @param {any} value - Value to remove
   * @param {Object} props - Additional properties
   * @param {boolean} props.restart - Whether to restart the app after removal
   * @returns {Promise<void>}
   */
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

  /**
   * Retrieves a shared preference configuration value from an application
   * @param {string} fullAppName - Full package name of the application
   * @param {string} key - Preference key to retrieve
   * @returns {Promise<string | null>} The preference value if found, null otherwise
   */
  public async getSharedConfig(
    fullAppName: string,
    key: string
  ): Promise<string | null> {
    const command = COMMANDS.getSharedPref
      .replace("$app", fullAppName)
      .replace("$key", key);
    return this.deviceClient.shell(command);
  }

  /**
   * Retrieves all shared preference configuration values from an application
   * @param {string} fullAppName - Full package name of the application
   * @returns {Promise<string | null>} All preference values if found, null otherwise
   */
  public async getAllSharedConfig(fullAppName: string): Promise<string | null> {
    const command = COMMANDS.getSharedPrefAll.replace("$app", fullAppName);
    return this.deviceClient.shell(command);
  }

  /**
   * Clears all shared preference configurations for an application
   * @param {string} fullAppName - Full package name of the application
   * @returns {Promise<string | null>} Result of the clear operation
   */
  public async clearAllSharedConfig(
    fullAppName: string
  ): Promise<string | null> {
    const command = COMMANDS.getSharedPrefClearAll.replace("$app", fullAppName);
    return this.deviceClient.shell(command);
  }

  /**
   * Clears a specific shared preference configuration for an application
   * @param {string} fullAppName - Full package name of the application
   * @param {string} key - Preference key to clear
   * @returns {Promise<string | null>} Result of the clear operation
   */
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
