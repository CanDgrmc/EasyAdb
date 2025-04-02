import { ChildProcessWithoutNullStreams } from 'child_process';
import internal from 'stream';
import { ReadStream } from 'fs';

type IAdbOptions = {
    path?: string;
    host?: string;
    port?: number;
    timeout?: number;
};
type IAdbOutputOptions = {
    hasVerbose?: boolean;
    noThrow?: boolean;
};

declare class Adb {
    ADB_PATH: string;
    TIMEOUT: number;
    private outputOptions;
    constructor(opts?: IAdbOptions);
    verbose(): this;
    noThrow(): this;
    shell(command: string): Promise<string | null>;
    reboot(): Promise<void>;
    uninstall(packagename: string): Promise<void>;
    exec(command: string, args?: string[]): Promise<string | null>;
    resolveStream(stream: ChildProcessWithoutNullStreams): Promise<string>;
    private executeCommand;
    startServer(): Promise<boolean>;
    push(stream: internal.Readable, remotePath: string, onProgress?: (transferred: number, total?: number) => void): Promise<string>;
    pull(path: string, to: string): Promise<void>;
    install(remotePath: string): Promise<string | null>;
    logcat(onLog?: (log: string) => void): ChildProcessWithoutNullStreams;
}

interface IAdbClient {
    connect?(host: string, port: number): Promise<boolean>;
    disconnect?(host: string, port: number): Promise<boolean>;
    shell(command: string): Promise<string | null>;
}

type DeviceMemory = {
    totalMemory: number;
    memFree: number;
    memUsed: number;
};
type StorageInfo = {
    Path: string;
    kBlock: string;
    Used: number;
    Available: number;
    UsePercentage: string;
    MountedOn: string;
};
interface CacheEntry<T> {
    value: T;
    timestamp: number;
}
type DeviceControlTapInputs = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
};
type DeviceControlSwipeInputs = {
    x: number;
    x2: number;
    y: number;
    y2: number;
    scaleX: number;
    scaleY: number;
    duration: number;
};
type DeviceControlTextInputs = {
    text: string;
};
type DeviceControlKeyCodeInputs = {
    keycode: string;
};

type DeviceProps_CacheEntry<T> = CacheEntry<T>;
type DeviceProps_DeviceControlKeyCodeInputs = DeviceControlKeyCodeInputs;
type DeviceProps_DeviceControlSwipeInputs = DeviceControlSwipeInputs;
type DeviceProps_DeviceControlTapInputs = DeviceControlTapInputs;
type DeviceProps_DeviceControlTextInputs = DeviceControlTextInputs;
type DeviceProps_DeviceMemory = DeviceMemory;
type DeviceProps_StorageInfo = StorageInfo;
declare namespace DeviceProps {
  export type { DeviceProps_CacheEntry as CacheEntry, DeviceProps_DeviceControlKeyCodeInputs as DeviceControlKeyCodeInputs, DeviceProps_DeviceControlSwipeInputs as DeviceControlSwipeInputs, DeviceProps_DeviceControlTapInputs as DeviceControlTapInputs, DeviceProps_DeviceControlTextInputs as DeviceControlTextInputs, DeviceProps_DeviceMemory as DeviceMemory, DeviceProps_StorageInfo as StorageInfo };
}

declare class AdbDeviceClient extends Adb {
    deviceId: string;
    constructor(deviceId: string, opts?: IAdbOptions);
    disconnect(): Promise<boolean>;
}

declare class DeviceClient {
    private deviceClient;
    private id;
    private cache;
    private readonly CACHE_TTL;
    constructor(deviceClient: AdbDeviceClient);
    /**
     *
     * @param key
     * @returns
     */
    private getCached;
    /**
     *
     * @param key
     * @param value
     */
    private setCached;
    /**
     *
     * @returns {string|null} device name
     */
    getName(): Promise<string | null>;
    /**
     * Retrieves the device's memory information
     * @returns {Promise<DeviceMemory | null>} Object containing memory information:
     *   - totalMemory: Total memory in KB
     *   - memFree: Free memory in KB
     *   - memUsed: Used memory in KB
     * @returns {null} If unable to retrieve memory information
     */
    getDeviceMemory(): Promise<DeviceMemory | null>;
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
    getStorage(): Promise<StorageInfo[] | null>;
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
    getAllProps(props?: string[]): Promise<string | {
        [key: string]: string;
    } | null>;
    /**
     * Returns the unique identifier of the connected device
     * @returns {string} The device ID
     */
    getDeviceId(): string;
    /**
     *
     * @returns {string|null} device name
     */
    /**
     * Retrieves the name of the connected Android device
     * @returns {Promise<string | null>} The device name if available, null otherwise
     */
    getDeviceName(): Promise<string | null>;
    /**
     * Gets the Android OS version of the connected device
     * @returns {Promise<string | null>} The Android version if available, null otherwise
     */
    getAndroidVersion(): Promise<string | null>;
    /**
     * Checks the current state of the device's screen
     * @returns {Promise<string | null>} The screen state if available, null otherwise
     */
    getScreenState(): Promise<string | null>;
    /**
     * Retrieves the screen resolution of the connected device
     * @returns {Promise<string | null>} The screen resolution if available, null otherwise
     */
    getScreenResolution(): Promise<string | null>;
    /**
     * Gets the manufacturer name of the connected device
     * @returns {Promise<string | null>} The manufacturer name if available, null otherwise
     */
    getManufacturer(): Promise<string | null>;
    /**
     * Retrieves the brand name of the connected device
     * @returns {Promise<string | null>} The brand name if available, null otherwise
     */
    getBrand(): Promise<string | null>;
    /**
     * Retrieves the SDK version of the connected device
     * @returns {Promise<string | null>} The SDK version if available, null otherwise
     */
    getSDKVersion(): Promise<string | null>;
    /**
     * Gets the screen density of the connected device
     * @returns {Promise<string | null>} The screen density if available, null otherwise
     */
    getScreenDensity(): Promise<string | null>;
    /**
     * Retrieves the system language setting of the device
     * @returns {Promise<string | null>} The system language if available, null otherwise
     */
    getSystemLanguage(): Promise<string | null>;
    /**
     * Gets the locale settings of the device
     * @returns {Promise<string | null>} The locale if available, null otherwise
     */
    getLocale(): Promise<string | null>;
    /**
     * Retrieves the model name of the connected device
     * @returns {Promise<string | null>} The device model if available, null otherwise
     */
    getModel(): Promise<string | null>;
    /**
     * Disables the launcher on the device
     * @returns {Promise<string | null>} Result of the operation
     */
    disableLauncher(): Promise<string | null>;
    /**
     * Enables the launcher on the device
     * @returns {Promise<string | null>} Result of the operation
     */
    enableLauncher(): Promise<string | null>;
    /**
     * Enables the system UI on the device
     * @returns {Promise<string | null>} Result of the operation
     */
    enableSystemUI(): Promise<string | null>;
    /**
     * Disables the system UI on the device
     * @returns {Promise<string | null>} Result of the operation
     */
    disableSystemUI(): Promise<string | null>;
    /**
     * Pulls a file from the device to the local system
     * @param {string} path - The path of the file on the device
     * @param {string} to - The destination path on the local system
     * @returns {Promise<void>}
     */
    pull(path: string, to: string): Promise<void>;
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
    push(path: string | ReadStream, remotePath: string, onProgress?: (transferred: number, total?: number) => void): Promise<boolean>;
    /**
     * Toggles the device's screen state (on/off)
     * @returns {Promise<string | null>} Result of the screen toggle operation
     */
    toggleScreen(): Promise<string | null>;
    /**
     * Sets the default home application (launcher)
     * @param {string} app - Package name of the app to set as home
     * @returns {Promise<string | null>} Result of the operation
     */
    setHomeApp(app: string): Promise<string | null>;
    /**
     * Clears the cache of a specified application
     * @param {string} app - Package name of the app to clear cache
     * @returns {Promise<string | null>} Result of the cache clearing operation
     */
    clearCache(app: string): Promise<string | null>;
    /**
     * Lists files and directories in the specified path on the device
     * @param {string} [path="/"] - Directory path to list contents from
     * @param {object|undefined} opts Optional ls properties
     * @param {boolean|undefined} opts.size Display size of files
     * @param {boolean|undefined} opts.recursive Display folders recursively
     * @returns {Promise<string[]>} Array of file/directory names
     */
    ls(path?: string, opts?: {
        size?: boolean;
        recursive?: boolean;
    }): Promise<string[]>;
    /**
     * Reboots the device
     * @returns {Promise<void>}
     */
    reboot(): Promise<void>;
    /**
     * Installs an Android application package (APK) on the device
     * @param path - The path to the APK file to install
     * @param props - Optional installation properties
     * @param props.reinstall - If true, reinstalls the app and keeps its data. Uses the -r flag
     * @param props.extra - Additional installation arguments to pass to the install command
     * @throws Will throw an error if the installation fails
     * @example
     * // Basic installation
     * await device.install("/path/to/app.apk");
     *
     * // Reinstall keeping data
     * await device.install("/path/to/app.apk", { reinstall: true });
     *
     * // Install with extra arguments
     * await device.install("/path/to/app.apk", {
     *   extra: ["-d", "--instant"]
     * });
     */
    install(path: string, props?: {
        reinstall?: boolean;
        extra?: string[];
    }): Promise<void>;
    /**
     * Uninstalls an application from the device
     * @param {string} packagename - Package name of the app to uninstall
     * @returns {Promise<void>}
     */
    uninstall(packagename: string): Promise<void>;
    /**
     * Sets a shared preference configuration value for an application
     * @param {string} fullAppName - Full package name of the application
     * @param {string} key - Preference key to set
     * @param {any} value - Value to set for the preference
     * @param {Object} props - Additional properties
     * @param {boolean} props.restart - Whether to restart the app after setting
     * @returns {Promise<void>}
     */
    putSharedConfig(fullAppName: string, key: string, value: any, props: {
        restart: boolean;
    }): Promise<void>;
    /**
     * Removes a shared preference configuration value from an application
     * @param {string} fullAppName - Full package name of the application
     * @param {string} key - Preference key to remove
     * @param {any} value - Value to remove
     * @param {Object} props - Additional properties
     * @param {boolean} props.restart - Whether to restart the app after removal
     * @returns {Promise<void>}
     */
    removeSharedConfig(fullAppName: string, key: string, value: any, props: {
        restart: boolean;
    }): Promise<void>;
    /**
     * Retrieves a shared preference configuration value from an application
     * @param {string} fullAppName - Full package name of the application
     * @param {string} key - Preference key to retrieve
     * @returns {Promise<string | null>} The preference value if found, null otherwise
     */
    getSharedConfig(fullAppName: string, key: string): Promise<string | null>;
    /**
     * Retrieves all shared preference configuration values from an application
     * @param {string} fullAppName - Full package name of the application
     * @returns {Promise<string | null>} All preference values if found, null otherwise
     */
    getAllSharedConfig(fullAppName: string): Promise<string | null>;
    /**
     * Clears all shared preference configurations for an application
     * @param {string} fullAppName - Full package name of the application
     * @returns {Promise<string | null>} Result of the clear operation
     */
    clearAllSharedConfig(fullAppName: string): Promise<string | null>;
    /**
     * Clears a specific shared preference configuration for an application
     * @param {string} fullAppName - Full package name of the application
     * @param {string} key - Preference key to clear
     * @returns {Promise<string | null>} Result of the clear operation
     */
    clearSharedConfig(fullAppName: string, key: string): Promise<string | null>;
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
    control(action: "tap" | "swipe" | "text" | "key", data: DeviceControlTapInputs | DeviceControlTextInputs | DeviceControlKeyCodeInputs | DeviceControlSwipeInputs): Promise<void>;
    /**
     * Takes a screenshot of the device's display and saves it to the specified path
     * @param remotePath - The path on the device where the screenshot will be saved (e.g., "/sdcard/screenshot.png")
     * @returns {Promise<void>} A promise that resolves when the screenshot is captured and saved
     * @throws Will throw an error if the screenshot cannot be taken or saved
     * @example
     * // Take a screenshot and save it to the device's storage
     * await device.getScreenshot("/sdcard/screenshot.png");
     *
     * // Take a screenshot with timestamp
     * const timestamp = Date.now();
     * await device.getScreenshot(`/sdcard/screenshot_${timestamp}.png`);
     */
    getScreenshot(remotePath: string): Promise<void>;
    /**
     * Opens the device's gallery app
     * @returns {Promise<void>} A promise that resolves when the gallery app is opened
     * @throws Will throw an error if the gallery app cannot be opened
     * @example
     * // Open the device's gallery app
     * await device.openGallery();
     */
    openGallery(): Promise<void>;
    /**
     * Broadcasts an action to all running applications
     * @param {string} action - The action to broadcast
     * @param {Object} props - Additional properties
     * @param {string[]} props.extra - Extra arguments to pass to the broadcast command
     * @returns {Promise<void>} A promise that resolves when the broadcast is sent
     * @throws Will throw an error if the broadcast cannot be sent
     * @example
     * // Broadcast an action to all running applications
     * await device.broadcast("com.example.ACTION");
     *
     * // Broadcast an action with extra arguments
     * await device.broadcast("com.example.ACTION", {
     *   extra: ["--es", "key", "value"]
     * });
     */
    broadcast(action: string, props?: {
        extra?: string[];
    }): Promise<void>;
    /**
     * Opens a URL in the device's default browser using an Android Intent
     * @param url - The URL to open (e.g., "https://www.example.com")
     * @returns {Promise<void>} A promise that resolves when the URL is opened
     * @throws Will throw an error if the URL cannot be opened or is malformed
     * @example
     * // Open a website
     * await device.openUrl("https://www.google.com");
     *
     * // Open a local file using file:// protocol
     * await device.openUrl("file:///sdcard/document.pdf");
     *
     * // Open a deep link
     * await device.openUrl("myapp://some/path");
     */
    openUrl(url: string): Promise<void>;
    /**
     * Starts monitoring device logs (logcat) and provides real-time log updates
     * @param onLog - Optional callback function that receives log messages as they arrive
     * @returns {() => void} A function that can be called to stop the logcat monitoring
     * @throws Will throw an error if the logcat stream encounters an error
     * @example
     * // Basic usage with console logging
     * const stopLogging = device.logcat((log) => {
     *   console.log('Device log:', log);
     * });
     *
     * // Stop logging after 5 seconds
     * setTimeout(() => {
     *   stopLogging();
     * }, 5000);
     *
     * // Filter specific logs
     * const stopLogging = device.logcat((log) => {
     *   if (log.includes('ERROR')) {
     *     console.error('Error in device logs:', log);
     *   }
     * });
     *
     * // Simple monitoring without callback
     * const stopLogging = device.logcat();
     */
    logcat(onLog?: (log: string) => void): () => void;
}

declare class AdbClient extends Adb implements IAdbClient {
    connect(deviceIp?: string): Promise<boolean>;
    disconnect(deviceIp: string): Promise<boolean>;
    getDevices(): Promise<DeviceClient[]>;
    getDevice(deviceId: string): Promise<DeviceClient>;
}

declare const parseProperty: (props: string, propName: string) => string;

interface IAdbDevice {
}

type AdbTypes = {
    IAdbClient: IAdbClient;
    IAdbDevice: IAdbDevice;
    IAdbOptions: IAdbOptions;
    IAdbOutputOptions: IAdbOutputOptions;
};

export { Adb, AdbClient, type AdbTypes, DeviceClient, DeviceProps, parseProperty };
