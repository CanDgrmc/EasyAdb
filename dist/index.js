"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Adb: () => Adb,
  AdbClient: () => AdbClient,
  DeviceClient: () => DeviceClient,
  parseProperty: () => parseProperty
});
module.exports = __toCommonJS(index_exports);

// src/lib/Adb.ts
var import_child_process = require("child_process");
var import_stream = require("stream");

// src/utils/FnHelpers.ts
function execIf(condition, fn, ...args) {
  if (condition) {
    return fn(...args);
  }
  return null;
}

// src/utils/StrHelper.ts
var prefixed = (prefix, ...strs) => {
  return strs.map((str) => {
    if (typeof str === "string") {
      return `${prefix} ${str}`;
    } else {
      return str;
    }
  });
};
var parseProperty = (props, propName) => {
  const match = props.match(new RegExp(`\\[${propName}\\]:\\s*\\[(.+?)\\]`));
  return match ? match[1] : "";
};

// src/utils/Logger.ts
var Logger = class {
  constructor(opts) {
    this.opts = {
      silent: false,
      prefix: "ADB"
    };
    if (opts.prefix) {
      this.opts.prefix = opts.prefix;
    }
    if (opts.silent) {
      this.opts.silent = opts.silent;
    }
  }
  static log(...args) {
    console.log(...args);
  }
  static warn(...args) {
    console.warn(...args);
  }
  static error(...args) {
    console.error(...args);
  }
  static info(...args) {
    console.info(...args);
  }
  static debug(...args) {
    console.debug(...args);
  }
  static trace(...args) {
    console.trace(...args);
  }
  static dir(...args) {
    console.dir(...args);
  }
  static group(...args) {
    console.group(...args);
  }
  log(...args) {
    execIf(
      !this.opts.silent,
      console.log,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  warn(...args) {
    execIf(
      !this.opts.silent,
      console.warn,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  error(...args) {
    execIf(
      !this.opts.silent,
      console.error,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  info(...args) {
    execIf(
      !this.opts.silent,
      console.info,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  debug(...args) {
    execIf(
      !this.opts.silent,
      console.debug,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  trace(...args) {
    execIf(
      !this.opts.silent,
      console.trace,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
};

// src/utils/Timeout.ts
var createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms
    );
  });
};
var executePromiseWithTimeout = (ms, promise) => __async(void 0, null, function* () {
  return new Promise((resolve, reject) => {
    Promise.race([promise, createTimeout(ms)]).then((res) => {
      if (res instanceof Error) {
        reject(`Operation timed out after ${ms}ms`);
      } else {
        resolve(res);
      }
    }).catch(reject);
  });
});

// src/lib/Adb.ts
var DEFAULT_OUTPUT_OPTIONS = {
  hasVerbose: false,
  noThrow: false
};
var DEFAULT_ADB_OPTIONS = {
  path: "adb",
  timeout: 1e4
};
var Adb = class {
  constructor(opts) {
    this.ADB_PATH = DEFAULT_ADB_OPTIONS.path || "adb";
    this.TIMEOUT = DEFAULT_ADB_OPTIONS.timeout || 1e4;
    this.outputOptions = DEFAULT_OUTPUT_OPTIONS;
    if (opts == null ? void 0 : opts.path) {
      this.ADB_PATH = opts.path;
    }
    if (opts == null ? void 0 : opts.host) {
      this.ADB_PATH = `${this.ADB_PATH} -H ${opts.host}`;
    }
    if (opts == null ? void 0 : opts.port) {
      this.ADB_PATH = `${this.ADB_PATH} -P ${opts.port}`;
    }
    if (opts == null ? void 0 : opts.timeout) {
      this.TIMEOUT = opts.timeout;
    }
  }
  verbose() {
    this.outputOptions.hasVerbose = true;
    return this;
  }
  noThrow() {
    this.outputOptions.noThrow = true;
    return this;
  }
  shell(command) {
    return __async(this, null, function* () {
      return yield this.exec(`shell ${command}`);
    });
  }
  reboot() {
    return __async(this, null, function* () {
      yield this.exec(`reboot`);
    });
  }
  uninstall(packagename) {
    return __async(this, null, function* () {
      if (!packagename) throw new Error("package name is required");
      yield this.exec(`uninstall ${packagename}`);
    });
  }
  exec(command, args) {
    return __async(this, null, function* () {
      try {
        const result = yield this.executeCommand(command, args);
        return result;
      } catch (error) {
        if (!this.outputOptions.noThrow) {
          throw error;
        }
        return null;
      } finally {
        this.outputOptions = DEFAULT_OUTPUT_OPTIONS;
      }
    });
  }
  resolveStream(stream) {
    return __async(this, null, function* () {
      const logger = new Logger({
        silent: !this.outputOptions.hasVerbose,
        prefix: "ADB"
      });
      try {
        const result = yield executePromiseWithTimeout(
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
            stream.on("error", (err) => {
              logger.error("Failed to execute command:", err);
              reject(err);
            });
          })
        );
        return result;
      } catch (error) {
        stream == null ? void 0 : stream.disconnect();
        throw error;
      }
    });
  }
  executeCommand(command, args) {
    return __async(this, null, function* () {
      const logger = new Logger({
        silent: !this.outputOptions.hasVerbose,
        prefix: "ADB"
      });
      const fullArgs = [command, ...args || []];
      logger.log(`Executing command: adb ${fullArgs.join(" ")}`);
      const adbProcess = (0, import_child_process.spawn)(
        this.ADB_PATH,
        fullArgs,
        { shell: true }
      );
      const result = yield this.resolveStream(adbProcess);
      return result;
    });
  }
  startServer() {
    return __async(this, null, function* () {
      const isStarted = yield this.exec("start-server");
      return !!isStarted;
    });
  }
  push(stream, remotePath, onProgress) {
    return __async(this, null, function* () {
      const adbProcess = (0, import_child_process.spawn)(this.ADB_PATH, [
        "push",
        remotePath
      ]);
      let totalSize;
      if ("size" in stream && typeof stream.size === "number") {
        totalSize = stream.size;
      }
      let bytesTransferred = 0;
      const progressTracker = new import_stream.Transform({
        transform(chunk, encoding, callback) {
          bytesTransferred += chunk.length;
          if (onProgress) {
            onProgress(bytesTransferred, totalSize);
          }
          callback(null, chunk);
        }
      });
      stream.pipe(progressTracker).pipe(adbProcess.stdin);
      const result = yield this.resolveStream(adbProcess);
      return result;
    });
  }
  pull(path, to) {
    return __async(this, null, function* () {
      this.exec("pull", [path, to]);
    });
  }
  install(remotePath) {
    return __async(this, null, function* () {
      const result = yield this.exec("install", [remotePath]);
      return result;
    });
  }
  logcat(onLog) {
    const adbProcess = (0, import_child_process.spawn)(
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
};

// src/lib/AdbDeviceClient.ts
var AdbDeviceClient = class extends Adb {
  constructor(deviceId, opts) {
    super(__spreadProps(__spreadValues({}, opts), { path: `${(opts == null ? void 0 : opts.path) || "adb"} -s ${deviceId}` }));
    this.deviceId = deviceId;
  }
  disconnect() {
    return __async(this, null, function* () {
      const result = yield this.exec("disconnect", [this.deviceId]);
      return !!result;
    });
  }
};

// src/lib/DeviceClient.ts
var import_fs = __toESM(require("fs"));
var COMMANDS = Object.freeze({
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
    key: `input keyevent $keycode`
  },
  screenshot: "screencap -p $path",
  mv: "mv $path $dest",
  cp: "cp $path $dest",
  chmod: "chmod $mode $path",
  chown: "chown $owner $path",
  chgrp: "chgrp $group $path",
  install: "pm install $path",
  uninstall: "pm uninstall $path",
  clearData: "pm clear $path",
  forceStop: "am force-stop $path",
  kill: "am kill $path",
  start: "am start $path",
  startForeground: "am start -W $path",
  startService: "am startservice $path",
  stopService: "am stopservice $path",
  broadcast: "am broadcast $path",
  listPackages: "pm list packages",
  listPackagesFull: "pm list packages -f",
  listPackagesAllUsers: "pm list packages -a",
  listPackagesAllUsersFull: "pm list packages -a -f",
  listPackagesUser: "pm list packages --user $user",
  listPackagesUserFull: "pm list packages --user $user -f",
  listPackagesAllUsersUser: "pm list packages -a --user $user",
  listPackagesAllUsersUserFull: "pm list packages -a --user $user -f",
  listPermissions: "pm list permissions",
  listPermissionsGroups: "pm list permission-groups",
  listPermissionsAll: "pm list permissions -a",
  listPermissionsAllGroups: "pm list permission-groups -a",
  listPermissionsUser: "pm list permissions --user $user",
  listPermissionsGroupsUser: "pm list permission-groups --user $user",
  listPermissionsAllUser: "pm list permissions -a --user $user",
  listPermissionsAllGroupsUser: "pm list permission-groups -a --user $user",
  listFeatures: "pm list features",
  listFeaturesUser: "pm list features --user $user",
  listLibraries: "pm list libraries",
  listLibrariesUser: "pm list libraries --user $user",
  listUsers: "pm list users",
  listUsersUser: "pm list users --user $user",
  listUsersUserFull: "pm list users --user $user -f"
});
var DeviceClient = class {
  // 5 minutes
  constructor(deviceClient) {
    this.CACHE_TTL = 5 * 60 * 1e3;
    this.deviceClient = deviceClient;
    this.id = deviceClient.deviceId;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param key
   * @returns
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }
    return null;
  }
  /**
   *
   * @param key
   * @param value
   */
  setCached(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
  /**
   *
   * @returns {string|null} device name
   */
  getName() {
    return __async(this, null, function* () {
      const cached = this.getCached("name");
      if (cached) return cached;
      const result = yield this.deviceClient.shell(COMMANDS.deviceName);
      if (result) {
        this.setCached("name", result);
      }
      return result;
    });
  }
  /**
   * Retrieves the device's memory information
   * @returns {Promise<DeviceMemory | null>} Object containing memory information:
   *   - totalMemory: Total memory in KB
   *   - memFree: Free memory in KB
   *   - memUsed: Used memory in KB
   * @returns {null} If unable to retrieve memory information
   */
  getDeviceMemory() {
    return __async(this, null, function* () {
      const cached = this.getCached("memory");
      if (cached) return cached;
      const result = yield this.deviceClient.shell(COMMANDS.memory);
      if (!result) {
        return null;
      }
      const parseMemValue = (pattern) => {
        const match = result.match(new RegExp(`${pattern}:\\s+(\\d+)\\s+kB`));
        return match ? parseInt(match[1], 10) : 0;
      };
      const totalMemory = parseMemValue("MemTotal");
      const memFree = parseMemValue("MemFree");
      const memoryInfo = {
        totalMemory,
        memFree,
        memUsed: totalMemory - memFree
      };
      this.setCached("memory", memoryInfo);
      return memoryInfo;
    });
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
  getStorage() {
    return __async(this, null, function* () {
      const cached = this.getCached("storage");
      if (cached) return cached;
      const result = yield this.deviceClient.shell(COMMANDS.storage);
      if (!result) {
        return null;
      }
      const storage = result.split("\n").slice(1).filter(Boolean).map((line) => {
        const [Path, kBlock, Used, Available, UsePercentage, MountedOn] = line.split(/\s+/).filter(Boolean);
        return {
          Path,
          kBlock,
          Used: parseInt(Used, 10),
          Available: parseInt(Available, 10),
          UsePercentage,
          MountedOn
        };
      });
      this.setCached("storage", storage);
      return storage;
    });
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
  getAllProps(props) {
    return __async(this, null, function* () {
      const getProps = (p) => {
        if (!props) return p;
        const result2 = {};
        for (let prop of props) {
          result2[prop] = parseProperty(p, prop);
        }
        return result2;
      };
      const cached = this.getCached("props");
      if (cached) return getProps(cached);
      const result = yield this.deviceClient.shell(COMMANDS.deviceProps);
      if (result) {
        this.setCached("props", result);
        return getProps(result);
      }
      return result;
    });
  }
  /**
   * Returns the unique identifier of the connected device
   * @returns {string} The device ID
   */
  getDeviceId() {
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
  getDeviceName() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.deviceName);
    });
  }
  /**
   * Gets the Android OS version of the connected device
   * @returns {Promise<string | null>} The Android version if available, null otherwise
   */
  getAndroidVersion() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.androidVersion);
    });
  }
  /**
   * Checks the current state of the device's screen
   * @returns {Promise<string | null>} The screen state if available, null otherwise
   */
  getScreenState() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.screenState);
    });
  }
  /**
   * Retrieves the screen resolution of the connected device
   * @returns {Promise<string | null>} The screen resolution if available, null otherwise
   */
  getScreenResolution() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.resolution);
    });
  }
  /**
   * Gets the manufacturer name of the connected device
   * @returns {Promise<string | null>} The manufacturer name if available, null otherwise
   */
  getManufacturer() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.manufacturer);
    });
  }
  /**
   * Retrieves the brand name of the connected device
   * @returns {Promise<string | null>} The brand name if available, null otherwise
   */
  getBrand() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.brand);
    });
  }
  /**
   * Retrieves the SDK version of the connected device
   * @returns {Promise<string | null>} The SDK version if available, null otherwise
   */
  getSDKVersion() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.SDKVersion);
    });
  }
  /**
   * Gets the screen density of the connected device
   * @returns {Promise<string | null>} The screen density if available, null otherwise
   */
  getScreenDensity() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.density);
    });
  }
  /**
   * Retrieves the system language setting of the device
   * @returns {Promise<string | null>} The system language if available, null otherwise
   */
  getSystemLanguage() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.language);
    });
  }
  /**
   * Gets the locale settings of the device
   * @returns {Promise<string | null>} The locale if available, null otherwise
   */
  getLocale() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.locale);
    });
  }
  /**
   * Retrieves the model name of the connected device
   * @returns {Promise<string | null>} The device model if available, null otherwise
   */
  getModel() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.model);
    });
  }
  /**
   * Disables the launcher on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  disableLauncher() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.disableLauncher);
    });
  }
  /**
   * Enables the launcher on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  enableLauncher() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.enableLauncher);
    });
  }
  /**
   * Enables the system UI on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  enableSystemUI() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.enableSystemUI);
    });
  }
  /**
   * Disables the system UI on the device
   * @returns {Promise<string | null>} Result of the operation
   */
  disableSystemUI() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.disableSystemUI);
    });
  }
  /**
   * Pulls a file from the device to the local system
   * @param {string} path - The path of the file on the device
   * @param {string} to - The destination path on the local system
   * @returns {Promise<void>}
   */
  pull(path, to) {
    return __async(this, null, function* () {
      return this.deviceClient.pull(path, to);
    });
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
  push(path, remotePath, onProgress) {
    return __async(this, null, function* () {
      if (typeof path === "string" && !import_fs.default.existsSync(path)) {
        throw new Error(`File ${path} does not exist`);
      }
      const stream = typeof path === "string" ? import_fs.default.createReadStream(path) : path;
      const installed = yield this.deviceClient.push(
        stream,
        remotePath,
        onProgress
      );
      return !!installed;
    });
  }
  /**
   * Toggles the device's screen state (on/off)
   * @returns {Promise<string | null>} Result of the screen toggle operation
   */
  toggleScreen() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.toggleScreen);
    });
  }
  /**
   * Sets the default home application (launcher)
   * @param {string} app - Package name of the app to set as home
   * @returns {Promise<string | null>} Result of the operation
   */
  setHomeApp(app) {
    return __async(this, null, function* () {
      return this.deviceClient.shell(`${COMMANDS.setHomeApp} ${app}`);
    });
  }
  /**
   * Clears the cache of a specified application
   * @param {string} app - Package name of the app to clear cache
   * @returns {Promise<string | null>} Result of the cache clearing operation
   */
  clearCache(app) {
    return __async(this, null, function* () {
      return this.deviceClient.shell(`pm clear ${app}`);
    });
  }
  /**
   * Lists files and directories in the specified path on the device
   * @param {string} [path="/"] - Directory path to list contents from
   * @param {object|undefined} opts Optional ls properties
   * @param {boolean|undefined} opts.size Display size of files
   * @param {boolean|undefined} opts.recursive Display folders recursively
   * @returns {Promise<string[]>} Array of file/directory names
   */
  ls(path, opts) {
    return __async(this, null, function* () {
      const paths = yield this.deviceClient.shell(
        `ls ${path || "/"} ${(opts == null ? void 0 : opts.size) ? "-s" : ""} ${(opts == null ? void 0 : opts.recursive) ? "-R" : ""}`.trim()
      );
      if (!paths) return [];
      return paths.split("\n");
    });
  }
  /**
   * Reboots the device
   * @returns {Promise<void>}
   */
  reboot() {
    return __async(this, null, function* () {
      yield this.deviceClient.reboot();
    });
  }
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
  install(path, props) {
    return __async(this, null, function* () {
      let command = COMMANDS.install.replace("$path", path);
      if (props == null ? void 0 : props.reinstall) {
        command += " -r";
      }
      if (props == null ? void 0 : props.extra) {
        command += ` ${props.extra.join(" ")}`;
      }
      yield this.deviceClient.shell(command);
    });
  }
  /**
   * Uninstalls an application from the device
   * @param {string} packagename - Package name of the app to uninstall
   * @returns {Promise<void>}
   */
  uninstall(packagename) {
    return __async(this, null, function* () {
      yield this.deviceClient.uninstall(packagename);
    });
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
  putSharedConfig(fullAppName, key, value, props) {
    return __async(this, null, function* () {
      let command = COMMANDS.setSharedPref.replace("$app", fullAppName).replace("$key", key).replace("$val", typeof value === "string" ? `"${value}"` : value);
      if (props.restart) {
        command += " --ez retart true";
      }
      yield this.deviceClient.shell(command);
    });
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
  removeSharedConfig(fullAppName, key, value, props) {
    return __async(this, null, function* () {
      let command = COMMANDS.removeSharedPref.replace("$app", fullAppName).replace("$key", key).replace("$val", typeof value === "string" ? `"${value}"` : value);
      if (props.restart) {
        command += " --ez retart true";
      }
      yield this.deviceClient.shell(command);
    });
  }
  /**
   * Retrieves a shared preference configuration value from an application
   * @param {string} fullAppName - Full package name of the application
   * @param {string} key - Preference key to retrieve
   * @returns {Promise<string | null>} The preference value if found, null otherwise
   */
  getSharedConfig(fullAppName, key) {
    return __async(this, null, function* () {
      const command = COMMANDS.getSharedPref.replace("$app", fullAppName).replace("$key", key);
      return this.deviceClient.shell(command);
    });
  }
  /**
   * Retrieves all shared preference configuration values from an application
   * @param {string} fullAppName - Full package name of the application
   * @returns {Promise<string | null>} All preference values if found, null otherwise
   */
  getAllSharedConfig(fullAppName) {
    return __async(this, null, function* () {
      const command = COMMANDS.getSharedPrefAll.replace("$app", fullAppName);
      return this.deviceClient.shell(command);
    });
  }
  /**
   * Clears all shared preference configurations for an application
   * @param {string} fullAppName - Full package name of the application
   * @returns {Promise<string | null>} Result of the clear operation
   */
  clearAllSharedConfig(fullAppName) {
    return __async(this, null, function* () {
      const command = COMMANDS.getSharedPrefClearAll.replace("$app", fullAppName);
      return this.deviceClient.shell(command);
    });
  }
  /**
   * Clears a specific shared preference configuration for an application
   * @param {string} fullAppName - Full package name of the application
   * @param {string} key - Preference key to clear
   * @returns {Promise<string | null>} Result of the clear operation
   */
  clearSharedConfig(fullAppName, key) {
    return __async(this, null, function* () {
      const command = COMMANDS.getSharedPrefClear.replace("$app", fullAppName).replace("$key", key);
      return this.deviceClient.shell(command);
    });
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
  control(action, data) {
    return __async(this, null, function* () {
      switch (action) {
        case "tap":
          const tapActionInput = data;
          yield this.deviceClient.shell(
            COMMANDS.controls.tap.replace("$deviceX", `${tapActionInput.x * tapActionInput.scaleX}`).replace("$deviceY", `${tapActionInput.y * tapActionInput.scaleY}`)
          );
          break;
        case "swipe":
          const swipeActionInput = data;
          yield this.deviceClient.shell(
            COMMANDS.controls.swipe.replace(
              "$deviceX1",
              `${Math.round(swipeActionInput.x * swipeActionInput.scaleX)}`
            ).replace(
              "$deviceY1",
              `${Math.round(swipeActionInput.y * swipeActionInput.scaleY)}`
            ).replace(
              "$deviceX2",
              `${Math.round(swipeActionInput.x2 * swipeActionInput.scaleX)}`
            ).replace(
              "$deviceY2",
              `${Math.round(swipeActionInput.y2 * swipeActionInput.scaleY)}`
            )
          );
          break;
        case "text":
          const textActionInput = data;
          yield this.deviceClient.shell(
            COMMANDS.controls.text.replace("$text", textActionInput.text)
          );
          break;
        case "key":
          const keyCodeActionInput = data;
          yield this.deviceClient.shell(
            COMMANDS.controls.key.replace("$keycode", keyCodeActionInput.keycode)
          );
          break;
      }
    });
  }
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
  getScreenshot(remotePath) {
    return __async(this, null, function* () {
      yield this.deviceClient.shell(
        COMMANDS.screenshot.replace("$path", remotePath)
      );
    });
  }
  /**
   * Opens the device's gallery app
   * @returns {Promise<void>} A promise that resolves when the gallery app is opened
   * @throws Will throw an error if the gallery app cannot be opened
   * @example
   * // Open the device's gallery app
   * await device.openGallery();
   */
  openGallery() {
    return __async(this, null, function* () {
      yield this.deviceClient.shell(
        COMMANDS.start.replace(
          "$path",
          "-t image/* -a android.intent.action.VIEW"
        )
      );
    });
  }
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
  broadcast(action, props) {
    return __async(this, null, function* () {
      let command = COMMANDS.broadcast.replace("$action", action);
      if (props == null ? void 0 : props.extra) {
        command += ` ${props.extra.join(" ")}`;
      }
      yield this.deviceClient.shell(command);
    });
  }
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
  openUrl(url) {
    return __async(this, null, function* () {
      yield this.deviceClient.shell(
        COMMANDS.start.replace("$path", `-a android.intent.action.VIEW -d ${url}`)
      );
    });
  }
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
  logcat(onLog) {
    const logcat = this.deviceClient.logcat(onLog);
    let end = () => {
    };
    new Promise((resolve, reject) => {
      end = reject;
      logcat.on("data", (data) => {
        if (onLog) {
          onLog(data.toString());
        }
      });
      logcat.on("close", () => {
        resolve();
      });
      logcat.on("error", (err) => {
        reject(err);
      });
    });
    return end;
  }
};

// src/lib/AdbClient.ts
var AdbClient = class extends Adb {
  connect(deviceIp) {
    return __async(this, null, function* () {
      let result;
      if (deviceIp) {
        result = yield this.exec("connect", [deviceIp]);
      } else {
        result = yield this.exec("connect");
      }
      return !!result;
    });
  }
  disconnect(deviceIp) {
    return __async(this, null, function* () {
      const result = yield this.exec("disconnect", [deviceIp]);
      return !!result;
    });
  }
  getDevices() {
    return __async(this, null, function* () {
      const devices = yield this.exec("devices");
      if (!devices) {
        return [];
      }
      const devicesList = devices.split("\n").slice(1);
      const devicesMap = devicesList.filter((line) => line.includes("	")).map((device) => {
        const [serial, _, ...rest] = device.split("	").filter(Boolean);
        const model = rest.join(" ");
        const adbDeviceClient = new AdbDeviceClient(serial, {
          path: this.ADB_PATH,
          timeout: this.TIMEOUT
        });
        const deviceClient = new DeviceClient(adbDeviceClient);
        return deviceClient;
      });
      return devicesMap;
    });
  }
  getDevice(deviceId) {
    return __async(this, null, function* () {
      const devices = yield this.getDevices();
      const device = devices.find(
        (device2) => device2.getDeviceId() === `${deviceId}`
      );
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }
      const adbDeviceClient = new AdbDeviceClient(deviceId, {
        path: this.ADB_PATH,
        timeout: this.TIMEOUT
      });
      const deviceClient = new DeviceClient(adbDeviceClient);
      return deviceClient;
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Adb,
  AdbClient,
  DeviceClient,
  parseProperty
});
