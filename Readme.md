# EasyAdb

A TypeScript library that provides a clean API for interacting with Android devices using the Android Debug Bridge (ADB).

## Features

- Easy-to-use API for common ADB operations
- TypeScript support with comprehensive type definitions
- Connection management to Android devices
- Device information retrieval (memory, storage, properties)
- File transfer capabilities
- App management functions
- Command execution on connected devices
- Timeouts and error handling
- Caching mechanism for frequently accessed device properties

## Installation

```bash
npm install @4lpha/easyadb

```

## Prerequisites

- ADB (Android Debug Bridge) must be installed on your system and available in your PATH
- For connection to physical devices, USB debugging must be enabled on the device

## Basic Usage

### Connecting to a Device

```typescript
import { AdbClient } from "@4lpha/easyadb";

// Create an ADB client
const adb = new AdbClient();

// Start the ADB server if not already running
await adb.startServer();

// Get a list of connected devices
const devices = await adb.getDevices();
console.log(`Found ${devices.length} devices`);

// Connect to a specific device using its ID
const deviceClient = await adb.getDevice("DEVICE_SERIAL_ID");

// Or connect to a device over network
await adb.connect("192.168.1.100:5555");
```

### Device Information

```typescript
// Get basic device information
const id = deviceClient.getDeviceId();
const name = await deviceClient.getName();
const model = await deviceClient.getModel();
const manufacturer = await deviceClient.getManufacturer();
const androidVersion = await deviceClient.getAndroidVersion();
const sdkVersion = await deviceClient.getSDKVersion();
const brand = await deviceClient.getBrand();
const screenDensity = await deviceClient.getScreenDensity();
const language = await deviceClient.getSystemLanguage();
const locale = await deviceClient.getLocale();

// Get device memory information
const memory = await deviceClient.getDeviceMemory();
console.log(`Total Memory: ${memory.totalMemory} kB`);
console.log(`Free Memory: ${memory.memFree} kB`);
console.log(`Used Memory: ${memory.memUsed} kB`);

// Get storage information
const storage = await deviceClient.getStorage();
console.log(`Available storage: ${storage[0].Available} kB`);

// Get all device properties as a string
const allProps = await deviceClient.getAllProps();
console.log(allProps);

// Get filtered device properties as an object
const specificProps = await deviceClient.getAllProps([
  "ro.product.model",
  "ro.build.version.release",
]);
console.log(specificProps); // { 'ro.product.model': 'Pixel', 'ro.build.version.release': '12' }

// List files in a directory
const files = await deviceClient.ls("/sdcard");
console.log(files);
```

### Executing Shell Commands

```typescript
// Execute a shell command on the device
const result = await deviceClient.deviceClient.shell("ls /sdcard");
console.log(result);

// You can also execute ADB commands directly
const output = await adb.exec("shell ls /sdcard");

// Or use the ls convenience method
const files = await deviceClient.ls("/sdcard");
console.log(files);
```

### File Transfer

```typescript
// Push a file to the device
await deviceClient.push(
  "/path/to/local/file",
  "/sdcard/destination",
  (transferred, total) => {
    console.log(
      `Transferred: ${transferred} bytes of ${total || "unknown"} bytes`
    );
  }
);

// Using streams
const fs = require("fs");
const readStream = fs.createReadStream("/path/to/local/file");

await deviceClient.push(
  readStream,
  "/sdcard/destination",
  (transferred, total) => {
    console.log(
      `Transferred: ${transferred} bytes of ${total || "unknown"} bytes`
    );
  }
);
```

### App Management

```typescript
// Install an APK
await adb.install("/sdcard/app.apk");

// Uninstall an app
await deviceClient.uninstall("com.example.app");

// Clear app cache
await deviceClient.clearCache("com.example.app");

// Set default home app
await deviceClient.setHomeApp(
  "com.example.launcher/com.example.launcher.MainActivity"
);

// Disable system UI
await deviceClient.disableSystemUI();

// Enable system UI
await deviceClient.enableSystemUI();
```

### Device Control

```typescript
// Toggle screen (on/off)
await deviceClient.toggleScreen();

// Get screen state
const screenState = await deviceClient.getScreenState();
console.log(`Screen is ${screenState}`);

// Get screen resolution
const resolution = await deviceClient.getScreenResolution();
console.log(`Screen resolution: ${resolution}`);

// Reboot the device
await deviceClient.reboot();

// Enable/disable launcher
await deviceClient.disableLauncher();
await deviceClient.enableLauncher();

// Take a basic screenshot
await deviceClient.getScreenshot("/sdcard/screenshot.png");

// Take a screenshot with timestamp
const timestamp = Date.now();
await deviceClient.getScreenshot(`/sdcard/screenshot_${timestamp}.png`

// Open URL in device browser
await deviceClient.openUrl("https://www.google.com");

// Open local file
await deviceClient.openUrl("file:///sdcard/document.pdf");

// Open app deep link
await deviceClient.openUrl("myapp://some/path");

// Monitor device logs
const stopLogging = deviceClient.logcat((log) => {
  console.log("Device log:", log);
});

// Filter specific log types
const stopErrorLogging = deviceClient.logcat((log) => {
  if (log.includes("ERROR")) {
    console.error("Error detected:", log);
  }
});

// Stop logging when done
stopLogging();
stopErrorLogging();
```

### Shared Preferences Management

```typescript
// Set a shared preference for an app
await deviceClient.putSharedConfig(
  "com.example.app",
  "preference_key",
  "value",
  { restart: true }
);

// Remove a shared preference
await deviceClient.removeSharedConfig(
  "com.example.app",
  "preference_key",
  "value",
  { restart: true }
);
```

## Advanced Configuration

### Custom ADB Path

```typescript
const adb = new AdbClient({
  path: "/custom/path/to/adb",
  timeout: 15000, // 15 seconds
});
```

### Connection Options

```typescript
const adb = new AdbClient({
  host: "127.0.0.1",
  port: 5037,
});
```

### Logging and Debugging

```typescript
// Enable verbose output
const result = await adb.verbose().shell("ls /sdcard");

// Suppress exceptions
const output = await adb.noThrow().exec("non-existent-command");
// output will be null instead of throwing an exception
```

## Connection Testing

```typescript
import { testAdbConnection } from "easy-adb";

// Test if ADB is properly connected
const isConnected = await testAdbConnection("adb", true);
if (isConnected) {
  console.log("ADB connection successful!");
} else {
  console.log("ADB connection failed.");
}
```

## Error Handling

The library provides comprehensive error handling:

```typescript
try {
  const result = await adb.exec("invalid-command");
} catch (error) {
  console.error("ADB execution failed:", error.message);
}

// Or use noThrow to prevent exceptions
const result = await adb.noThrow().exec("invalid-command");
if (result === null) {
  console.log("Command failed but no exception was thrown");
}
```

## API Reference

### Adb Class

The base class that provides core ADB functionality.

| Method                                                              | Description                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| `verbose()`                                                         | Enables verbose output for subsequent operations      |
| `noThrow()`                                                         | Disables exception throwing for subsequent operations |
| `shell(command: string)`                                            | Executes a shell command on the connected device      |
| `reboot()`                                                          | Reboots the connected device                          |
| `uninstall(packagename: string)`                                    | Uninstalls an app by package name                     |
| `exec(command: string, args?: string[])`                            | Executes an arbitrary ADB command                     |
| `startServer()`                                                     | Starts the ADB server                                 |
| `getDevices()`                                                      | Returns a list of connected devices                   |
| `push(stream: Readable, remotePath: string, onProgress?: Function)` | Pushes a file to the device                           |
| `pull(path: string, to: string)`                                    | Pulls a file from the device                          |
| `install(remotePath: string)`                                       | Installs an APK from the device                       |

### AdbClient Class

Extends the Adb class with additional device connection functionality.

| Method                         | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `connect(deviceIp?: string)`   | Connects to a device via network                   |
| `disconnect(deviceIp: string)` | Disconnects from a device                          |
| `getDevice(deviceId: string)`  | Gets a DeviceClient instance for a specific device |
| _Plus all methods from Adb_    |                                                    |

### DeviceClient Class

Provides high-level device operations and caching capabilities.

| Method                                                                            | Description                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------- |
| `getDeviceId()`                                                                   | Returns the device ID/serial number         |
| `getName()`                                                                       | Gets the device name                        |
| `getDeviceMemory()`                                                               | Gets memory information (total, free, used) |
| `getStorage()`                                                                    | Gets storage information                    |
| `getAllProps(props?: string[])`                                                   | Gets all or filtered device properties      |
| `getAndroidVersion()`                                                             | Gets the Android version                    |
| `getScreenState()`                                                                | Gets the screen state (ON/OFF)              |
| `getScreenResolution()`                                                           | Gets the screen resolution                  |
| `getManufacturer()`                                                               | Gets the device manufacturer                |
| `getBrand()`                                                                      | Gets the device brand                       |
| `getSDKVersion()`                                                                 | Gets the Android SDK version                |
| `getScreenDensity()`                                                              | Gets the screen density                     |
| `getSystemLanguage()`                                                             | Gets the system language                    |
| `getLocale()`                                                                     | Gets the system locale                      |
| `getModel()`                                                                      | Gets the device model                       |
| `disableLauncher()`                                                               | Disables the default launcher               |
| `enableLauncher()`                                                                | Enables the default launcher                |
| `enableSystemUI()`                                                                | Enables the system UI                       |
| `disableSystemUI()`                                                               | Disables the system UI                      |
| `pull(path: string, to: string)`                                                  | Pulls a file from the device                |
| `push(path: string \| ReadStream, remotePath: string, onProgress?: Function)`     | Pushes a file to the device                 |
| `toggleScreen()`                                                                  | Toggles the screen on/off                   |
| `setHomeApp(app: string)`                                                         | Sets the default home app                   |
| `clearCache(app: string)`                                                         | Clears an app's cache                       |
| `ls(path?: string)`                                                               | Lists files in a directory                  |
| `reboot()`                                                                        | Reboots the device                          |
| `uninstall(packagename: string)`                                                  | Uninstalls an app                           |
| `putSharedConfig(fullAppName: string, key: string, value: any, props: object)`    | Sets a shared preference                    |
| `removeSharedConfig(fullAppName: string, key: string, value: any, props: object)` | Removes a shared preference                 |

## TypeScript Support

This library is written in TypeScript and provides comprehensive type definitions for all classes and methods.

### Type Definitions

```typescript
import type {
  IAdbClient,
  IAdbOptions,
  IAdbOutputOptions,
  DeviceMemory,
  StorageInfo,
  CacheEntry,
  ILoggerOptions,
} from "easy-adb";

// ADB Options Interface
const options: IAdbOptions = {
  path: "/custom/path/to/adb",
  host: "127.0.0.1",
  port: 5037,
  timeout: 15000,
};

// Device Memory Type
const memoryInfo: DeviceMemory = {
  totalMemory: 4096000,
  memFree: 1024000,
  memUsed: 3072000,
};

// Storage Info Type
const storageExample: StorageInfo = {
  Path: "/dev/block/dm-0",
  kBlock: "59620760",
  Used: 24687200,
  Available: 31854632,
  UsePercentage: "44%",
  MountedOn: "/data",
};
```

### Full TypeScript Example

```typescript
import { AdbClient, DeviceClient } from "easy-adb";
import type { DeviceMemory, StorageInfo, IAdbOptions } from "easy-adb";
import { createReadStream } from "fs";

// Define custom options with TypeScript interface
const adbOptions: IAdbOptions = {
  path: "adb",
  timeout: 20000,
  host: "localhost",
  port: 5037,
};

async function manageDevices(): Promise<void> {
  try {
    // Initialize ADB client with typed options
    const adb = new AdbClient(adbOptions);

    // Start server and check connection
    const serverStarted: boolean = await adb.startServer();
    console.log(`ADB server started: ${serverStarted}`);

    // Get connected devices with proper typing
    const devices: DeviceClient[] = await adb.getDevices();
    console.log(`Found ${devices.length} device(s)`);

    if (devices.length > 0) {
      // Get the first device
      const device = devices[0];
      const deviceId: string = device.getDeviceId();
      console.log(`Working with device: ${deviceId}`);

      // Get device memory with strong typing
      const memory: DeviceMemory = await device.getDeviceMemory();
      console.log(
        `Memory: ${memory.totalMemory} kB total, ${memory.memFree} kB free`
      );

      // Get storage information with proper typing
      const storage: StorageInfo[] = await device.getStorage();

      // Execute a shell command
      const properties: string = await device.getAllProps();

      // Push a file with progress tracking
      const localFile = "./app.apk";
      const remotePath = "/sdcard/app.apk";
      const pushResult: boolean = await device.push(localFile, remotePath);

      // Install the pushed APK
      if (pushResult) {
        const installResult: string | null = await adb.install(remotePath);
        console.log(`Installation result: ${installResult}`);
      }

      // Manage system UI
      await device.disableSystemUI();
      // Re-enable it later
      setTimeout(async () => {
        await device.enableSystemUI();
      }, 5000);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

// Execute the function
manageDevices().catch(console.error);
```

### Async/Await Pattern Example

```typescript
import { AdbClient, testAdbConnection } from "easy-adb";

// Fully typed async function
(async (): Promise<void> => {
  // Test connection first
  const isConnected: boolean = await testAdbConnection("adb", true);

  if (!isConnected) {
    console.error("ADB not properly connected or installed");
    return;
  }

  const adb = new AdbClient();

  try {
    // Connect to a device via IP
    await adb.connect("192.168.1.100:5555");

    // Get a device by ID with proper error handling
    try {
      const device = await adb.getDevice("192.168.1.100:5555");

      // Get multiple properties in parallel with Promise.all
      const [androidVersion, sdkVersion, model, brand] = await Promise.all([
        device.getAndroidVersion(),
        device.getSDKVersion(),
        device.getModel(),
        device.getBrand(),
      ]);

      console.log(`Device: ${model} by ${brand}`);
      console.log(`Android version: ${androidVersion} (SDK ${sdkVersion})`);
    } catch (deviceError) {
      console.error(`Device error: ${(deviceError as Error).message}`);
    }

    // Disconnect when done
    await device.disconnect();
  } catch (error) {
    console.error(`Error in ADB operations: ${(error as Error).message}`);
  }
})();
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run development mode
npm run dev

# Watch mode with environment variables
npm run dev:watch

# Build the project
npm run build

# Lint the code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## TODO / Roadmap

The following features are planned for future releases:

- Screen streaming and recording with encoding/decoding support (using FFmpeg)
- Built-in installations (adb, ffmpeg etc.)
- Performance monitoring and profiling tools
- Listeners & Hooks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
