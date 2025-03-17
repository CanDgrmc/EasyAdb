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
  setSharedPref: `adb shell 'am broadcast -a $app.sp.PUT --es key $key --es value $val'`,
  removeSharedPref: `adb shell 'am broadcast -a $app.sp.CLEAR --es key $key --es value $val'`
});
var DeviceClient = class {
  // 5 minutes
  constructor(deviceClient) {
    this.CACHE_TTL = 5 * 60 * 1e3;
    this.deviceClient = deviceClient;
    this.id = deviceClient.deviceId;
    this.cache = /* @__PURE__ */ new Map();
  }
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }
    return null;
  }
  setCached(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
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
  getDeviceId() {
    return this.id;
  }
  getAndroidVersion() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.androidVersion);
    });
  }
  getScreenState() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.screenState);
    });
  }
  getScreenResolution() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.resolution);
    });
  }
  getManufacturer() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.manufacturer);
    });
  }
  getBrand() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.brand);
    });
  }
  getSDKVersion() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.SDKVersion);
    });
  }
  getScreenDensity() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.density);
    });
  }
  getSystemLanguage() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.language);
    });
  }
  getLocale() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.locale);
    });
  }
  getModel() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.model);
    });
  }
  disableLauncher() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.disableLauncher);
    });
  }
  enableLauncher() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.enableLauncher);
    });
  }
  enableSystemUI() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.enableSystemUI);
    });
  }
  disableSystemUI() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.disableSystemUI);
    });
  }
  pull(path, to) {
    return __async(this, null, function* () {
      return this.deviceClient.pull(path, to);
    });
  }
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
  toggleScreen() {
    return __async(this, null, function* () {
      return this.deviceClient.shell(COMMANDS.toggleScreen);
    });
  }
  setHomeApp(app) {
    return __async(this, null, function* () {
      return this.deviceClient.shell(`${COMMANDS.setHomeApp} ${app}`);
    });
  }
  clearCache(app) {
    return __async(this, null, function* () {
      return this.deviceClient.shell(`pm clear ${app}`);
    });
  }
  ls(path) {
    return __async(this, null, function* () {
      const paths = yield this.deviceClient.shell(`ls ${path || "/"}`);
      if (!paths) return [];
      return paths.split("\n");
    });
  }
  reboot() {
    return __async(this, null, function* () {
      yield this.deviceClient.reboot();
    });
  }
  uninstall(packagename) {
    return __async(this, null, function* () {
      yield this.deviceClient.uninstall(packagename);
    });
  }
  putSharedConfig(fullAppName, key, value, props) {
    return __async(this, null, function* () {
      let command = COMMANDS.setSharedPref.replace("$app", fullAppName).replace("$key", key).replace("$val", typeof value === "string" ? `"${value}"` : value);
      if (props.restart) {
        command += " --ez retart true";
      }
      yield this.deviceClient.shell(command);
    });
  }
  removeSharedConfig(fullAppName, key, value, props) {
    return __async(this, null, function* () {
      let command = COMMANDS.removeSharedPref.replace("$app", fullAppName).replace("$key", key).replace("$val", typeof value === "string" ? `"${value}"` : value);
      if (props.restart) {
        command += " --ez retart true";
      }
      yield this.deviceClient.shell(command);
    });
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
      const devicesMap = devicesList.filter((i) => i.length > 2).map((device) => {
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
