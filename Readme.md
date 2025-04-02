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
const result = await deviceClient.shell("ls /sdcard");
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

// Pull a file from the device
await deviceClient.pull(
  "/sdcard/file.txt",
  "/path/to/local/destination",
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
await deviceClient.install("/sdcard/app.apk");

// Install with options
await deviceClient.install("/sdcard/app.apk", {
  replace: true, // Replace existing app
  allowDowngrade: true, // Allow version downgrade
  grantPermissions: true, // Automatically grant all permissions
});

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

// Device interaction controls
// Tap on screen
await deviceClient.control({
  type: "tap",
  x: 500,
  y: 800,
});

// Swipe on screen
await deviceClient.control({
  type: "swipe",
  x1: 500,
  y1: 1000,
  x2: 500,
  y2: 200,
});

// Input text
await deviceClient.control({
  type: "text",
  text: "Hello world",
});

// Press a key (keyevent)
await deviceClient.control({
  type: "key",
  keycode: 66, // ENTER key
});

// Take a basic screenshot
await deviceClient.getScreenshot("/sdcard/screenshot.png");

// Take a screenshot with timestamp
const timestamp = Date.now();
await deviceClient.getScreenshot(`/sdcard/screenshot_${timestamp}.png`);

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

// Get a shared preference value
const value = await deviceClient.getSharedConfig(
  "com.example.app",
  "preference_key"
);

// Get all shared preferences
const allPrefs = await deviceClient.getAllSharedConfig("com.example.app");

// Remove a shared preference
await deviceClient.removeSharedConfig(
  "com.example.app",
  "preference_key",
  "value",
  { restart: true }
);

// Clear a specific shared preference
await deviceClient.clearSharedConfig("com.example.app", "preference_key");

// Clear all shared preferences
await deviceClient.clearAllSharedConfig("com.example.app");
```

### Broadcast Actions

```typescript
// Send a broadcast
await deviceClient.broadcast("com.example.ACTION", {
  extras: {
    key1: "value1",
    key2: "value2",
  },
});
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
import { testAdbConnection } from "@4lpha/easyadb";

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

## Example Use Cases

### Automated Testing Scenario

```typescript
// Example test scenario
async function testLoginFlow() {
  const adb = new AdbClient();
  await adb.startServer();

  const device = await adb.getDevice("emulator-5554");

  // Launch the app
  await device.shell("am start -n com.example.app/.MainActivity");

  // Tap on username field
  await device.control({
    type: "tap",
    x: 500,
    y: 700,
  });

  // Enter username
  await device.control({
    type: "text",
    text: "testuser@example.com",
  });

  // Tap on password field
  await device.control({
    type: "tap",
    x: 500,
    y: 800,
  });

  // Enter password
  await device.control({
    type: "text",
    text: "password123",
  });

  // Tap login button
  await device.control({
    type: "tap",
    x: 500,
    y: 900,
  });

  // Check if main page loaded
  const logs = [];
  const stopLogging = device.logcat((log) => {
    logs.push(log);
    if (log.includes("MainActivity: onResume")) {
      console.log("Login successful!");
      stopLogging();
    }
  });

  // Take screenshot of result
  await device.getScreenshot("/sdcard/login_result.png");
  await device.pull("/sdcard/login_result.png", "./login_result.png");
}
```

### Device Monitoring and Reporting

```typescript
// Monitor and report device status
async function monitorDeviceStatus() {
  const adb = new AdbClient();
  await adb.startServer();

  const devices = await adb.getDevices();

  for (const device of devices) {
    // Get device information
    const model = await device.getModel();
    const androidVersion = await device.getAndroidVersion();
    const memory = await device.getDeviceMemory();
    const storage = await device.getStorage();

    console.log(`Device: ${model} (Android ${androidVersion})`);
    console.log(`Memory Usage: ${memory.memUsed}/${memory.totalMemory} kB`);
    console.log(`Storage: ${storage[0].Available}/${storage[0].kBlock} kB`);

    // Take screenshot
    const timestamp = Date.now();
    await device.getScreenshot(`/sdcard/status_${timestamp}.png`);
    await device.pull(
      `/sdcard/status_${timestamp}.png`,
      `./status_${model}_${timestamp}.png`
    );
  }
}
```

## API Reference

### Adb Class

The base class that provides core ADB functionality.

| Method                                   | Description                                            |
| ---------------------------------------- | ------------------------------------------------------ |
| `constructor(options?: IAdbOptions)`     | Creates a new ADB instance with optional configuration |
| `verbose()`                              | Enables verbose output for the next command            |
| `noThrow()`                              | Prevents exceptions for the next command               |
| `shell(command: string)`                 | Executes a shell command                               |
| `exec(command: string, args?: string[])` | Executes an ADB command with optional arguments        |
| `reboot()`                               | Reboots the device                                     |
| `uninstall(packagename: string)`         | Uninstalls an app by package name                      |

## API Reference (continued)

### AdbClient Class

Extends the Adb class with additional client functionality.

| Method                                             | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- |
| `startServer()`                                    | Starts the ADB server if not already running       |
| `killServer()`                                     | Stops the ADB server                               |
| `getDevices()`                                     | Returns a list of connected devices                |
| `getDevice(id: string)`                            | Returns a DeviceClient for the specified device ID |
| `connect(address: string)`                         | Connects to a device over network                  |
| `disconnect(address?: string)`                     | Disconnects from a device or all devices           |
| `waitForDevice(serial?: string, timeout?: number)` | Waits for a device to be connected                 |
| `tcpip(port?: number)`                             | Restarts ADB in TCP/IP mode                        |

### DeviceClient Class

Provides device-specific functionality.

| Method                                                                                               | Description                                         |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `getDeviceId()`                                                                                      | Returns the device ID                               |
| `getName()`                                                                                          | Returns the device name                             |
| `getModel()`                                                                                         | Returns the device model                            |
| `getManufacturer()`                                                                                  | Returns the device manufacturer                     |
| `getBrand()`                                                                                         | Returns the device brand                            |
| `getAndroidVersion()`                                                                                | Returns the Android version                         |
| `getSDKVersion()`                                                                                    | Returns the SDK version                             |
| `getScreenDensity()`                                                                                 | Returns the screen density                          |
| `getSystemLanguage()`                                                                                | Returns the system language                         |
| `getLocale()`                                                                                        | Returns the device locale                           |
| `getDeviceMemory()`                                                                                  | Returns memory usage information                    |
| `getStorage()`                                                                                       | Returns storage information                         |
| `getScreenResolution()`                                                                              | Returns screen resolution                           |
| `getScreenState()`                                                                                   | Returns screen state (on/off)                       |
| `getAllProps(filter?: string[])`                                                                     | Returns device properties                           |
| `getProp(prop: string)`                                                                              | Returns a specific device property                  |
| `shell(command: string)`                                                                             | Executes a shell command on the device              |
| `ls(path: string)`                                                                                   | Lists files in a directory                          |
| `push(src: string \| ReadStream, dest: string, callback?: TransferCallback)`                         | Transfers a file to the device                      |
| `pull(src: string, dest: string \| WriteStream, callback?: TransferCallback)`                        | Transfers a file from the device                    |
| `install(apkPath: string, options?: InstallOptions)`                                                 | Installs an APK                                     |
| `uninstall(packageName: string)`                                                                     | Uninstalls an app                                   |
| `clearCache(packageName: string)`                                                                    | Clears app cache                                    |
| `toggleScreen()`                                                                                     | Toggles screen on/off                               |
| `reboot()`                                                                                           | Reboots the device                                  |
| `setHomeApp(app: string)`                                                                            | Sets default home app                               |
| `disableSystemUI()`                                                                                  | Disables system UI                                  |
| `enableSystemUI()`                                                                                   | Enables system UI                                   |
| `disableLauncher()`                                                                                  | Disables launcher                                   |
| `enableLauncher()`                                                                                   | Enables launcher                                    |
| `getScreenshot(path: string)`                                                                        | Takes a screenshot                                  |
| `control(options: ControlOptions)`                                                                   | Performs device interaction (tap, swipe, text, key) |
| `openUrl(url: string)`                                                                               | Opens a URL in the device browser                   |
| `logcat(callback: (log: string) => void)`                                                            | Monitors device logs                                |
| `putSharedConfig(packageName: string, key: string, value: string, options?: SharedConfigOptions)`    | Sets a shared preference                            |
| `getSharedConfig(packageName: string, key: string)`                                                  | Gets a shared preference value                      |
| `getAllSharedConfig(packageName: string)`                                                            | Gets all shared preferences                         |
| `removeSharedConfig(packageName: string, key: string, value: string, options?: SharedConfigOptions)` | Removes a shared preference                         |
| `clearSharedConfig(packageName: string, key: string)`                                                | Clears a specific shared preference                 |
| `clearAllSharedConfig(packageName: string)`                                                          | Clears all shared preferences                       |
| `broadcast(action: string, options?: BroadcastOptions)`                                              | Sends a broadcast action                            |

## Common KeyEvent Codes

Here are some commonly used KeyEvent codes for the `control({ type: "key", keycode: number })` function:

| Key                      | Code | Description      |
| ------------------------ | ---- | ---------------- |
| KEYCODE_ENTER            | 66   | Enter key        |
| KEYCODE_TAB              | 61   | Tab key          |
| KEYCODE_SPACE            | 62   | Space key        |
| KEYCODE_BACK             | 4    | Back button      |
| KEYCODE_HOME             | 3    | Home button      |
| KEYCODE_MENU             | 82   | Menu button      |
| KEYCODE_POWER            | 26   | Power button     |
| KEYCODE_VOLUME_UP        | 24   | Volume up        |
| KEYCODE_VOLUME_DOWN      | 25   | Volume down      |
| KEYCODE_DPAD_UP          | 19   | D-pad up         |
| KEYCODE_DPAD_DOWN        | 20   | D-pad down       |
| KEYCODE_DPAD_LEFT        | 21   | D-pad left       |
| KEYCODE_DPAD_RIGHT       | 22   | D-pad right      |
| KEYCODE_DPAD_CENTER      | 23   | D-pad center     |
| KEYCODE_CAMERA           | 27   | Camera button    |
| KEYCODE_SEARCH           | 84   | Search button    |
| KEYCODE_MEDIA_PLAY_PAUSE | 85   | Play/pause media |
| KEYCODE_MEDIA_STOP       | 86   | Stop media       |
| KEYCODE_MEDIA_NEXT       | 87   | Next media       |
| KEYCODE_MEDIA_PREVIOUS   | 88   | Previous media   |

For alphabetic keys, use codes 29-54 (a-z). For numeric keys, use codes 7-16 (0-9).

## Advanced Examples

### App Testing with Screenshots

```typescript
async function testApp() {
  const adb = new AdbClient();
  const device = await adb.getDevice();

  // Clear app data before testing
  await device.clearCache("com.example.app");

  // Start the app
  await device.shell("am start -n com.example.app/.MainActivity");

  // Wait for app to load
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Take a screenshot of the initial state
  await device.getScreenshot("/sdcard/test_initial.png");

  // Perform a series of interactions
  await device.control({ type: "tap", x: 300, y: 500 });
  await device.control({ type: "text", text: "Test input" });
  await device.control({ type: "key", keycode: 66 }); // Press Enter

  // Wait for response
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Take a screenshot of the result
  await device.getScreenshot("/sdcard/test_result.png");

  // Pull screenshots to local machine
  await device.pull("/sdcard/test_initial.png", "./test_initial.png");
  await device.pull("/sdcard/test_result.png", "./test_result.png");
}
```

### Device Performance Monitoring

```typescript
async function monitorPerformance(packageName, durationSeconds) {
  const adb = new AdbClient();
  const device = await adb.getDevice();

  console.log(
    `Starting performance monitoring for ${packageName} for ${durationSeconds} seconds`
  );

  // Start the app
  await device.shell(`am start -n ${packageName}/.MainActivity`);

  const startTime = Date.now();
  const endTime = startTime + durationSeconds * 1000;

  // Collect metrics at intervals
  const metrics = [];

  while (Date.now() < endTime) {
    // Get memory usage
    const memoryOutput = await device.shell(`dumpsys meminfo ${packageName}`);
    const memMatch = memoryOutput.match(/TOTAL\s+(\d+)/);
    const memoryUsage = memMatch ? parseInt(memMatch[1]) : null;

    // Get CPU usage
    const cpuOutput = await device.shell(
      `dumpsys cpuinfo | grep ${packageName}`
    );
    const cpuMatch = cpuOutput.match(/(\d+(?:\.\d+)?)%/);
    const cpuUsage = cpuMatch ? parseFloat(cpuMatch[1]) : null;

    metrics.push({
      timestamp: new Date(),
      memory: memoryUsage,
      cpu: cpuUsage,
    });

    // Take a screenshot
    const timestamp = Date.now();
    await device.getScreenshot(`/sdcard/perf_${timestamp}.png`);

    // Wait before next sample
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Generate report
  console.log("Performance Report:");
  console.log("==================");

  metrics.forEach((metric) => {
    console.log(`Time: ${metric.timestamp.toISOString()}`);
    console.log(`Memory: ${metric.memory ? metric.memory + " KB" : "N/A"}`);
    console.log(`CPU: ${metric.cpu ? metric.cpu + "%" : "N/A"}`);
    console.log("------------------");
  });

  // Calculate averages
  const avgMemory =
    metrics.reduce((sum, m) => sum + (m.memory || 0), 0) / metrics.length;
  const avgCpu =
    metrics.reduce((sum, m) => sum + (m.cpu || 0), 0) / metrics.length;

  console.log(`Average Memory Usage: ${avgMemory.toFixed(2)} KB`);
  console.log(`Average CPU Usage: ${avgCpu.toFixed(2)}%`);
}
```

## Troubleshooting

### Common Issues

1. **"ADB server not running"**

   - Solution: Call `adb.startServer()` before other operations.

2. **"Device not found"**

   - Ensure the device is connected and USB debugging is enabled
   - Try `adb.waitForDevice()` to wait for a device connection

3. **Permission errors**

   - Ensure ADB has proper permissions to access files
   - For push/pull operations, check file permissions on both device and host

4. **"Command timed out"**
   - Increase the timeout in the AdbClient constructor options
   - Check device connectivity

### Debugging Tips

1. Use `verbose()` to see detailed command output:

   ```typescript
   const result = await adb.verbose().exec("devices");
   ```

2. Check ADB version:

   ```typescript
   const version = await adb.exec("version");
   console.log(version);
   ```

3. Test connection:
   ```typescript
   const isConnected = await testAdbConnection();
   console.log(isConnected ? "Connected" : "Not connected");
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information and updates, visit the [GitHub repository](https://github.com/yourusername/easyadb).
