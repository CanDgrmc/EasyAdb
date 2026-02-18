# Roadmap & TODOs

## 🚀 High Priority Features

- [ ] **Port Forwarding & Reverse**
  - Implement `adb forward` (TCP/localabstract)
  - Implement `adb reverse`
  - List and remove specific forwarding rules

- [ ] **Wireless Debugging (Android 11+)**
  - Support `adb pair` functionality with IP and pairing code
  - Simplify the connection flow for QR code pairing (if possible via CLI)

- [ ] **Screen Recording**
  - Wrapper around `screenrecord` command
  - Support options for bitrate, time limit, and size
  - Stream output directly to a local file stream

## 🛠️ Utilities & Enhancements

- [ ] **Advanced Logcat**
  - Structured log parsing (Level, Tag, PID, Message)
  - Filtering by application ID (automatically finding PID from package name)
  - Colorized output for CLI usage

- [ ] **File System Operations**
  - Recursive directory listing
  - `cp` (Copy file on device)
  - `mv` (Move/Rename file on device)
  - `rm -r` (Recursive delete)
  - `mkdir -p` (Create directory tree)

- [ ] **Process Management**
  - `ps` wrapper to list running processes with details
  - `kill` process by PID or Package Name
  - `top` parser execution for performance monitoring

- [ ] **Battery & Power**
  - Parse `dumpsys battery` output
  - Get level, status (charging/discharging), health, technology, temperature
  - Commands to fake battery status (for testing)

## 📱 Device Control & Testing

- [ ] **Monkey Testing**
  - Wrapper for `adb shell monkey`
  - Configure event percentages (touch, motion, nav, syskeys)
  - Seed support for reproducible tests

- [ ] **Emulator Console (Telnet)**
  - Send SMS to emulator
  - Mock incoming phone calls
  - Set GPS location (`geo fix`)
  - Network condition simulation (speed, latency)

- [ ] **Backup & Restore**
  - `adb backup` implementation (with options for apk, shared storage, etc.)
  - `adb restore` implementation

## 📦 Fastboot Support (Future Scope)

- [ ] **Fastboot Mode Detection**
- [ ] **Reboot to Bootloader/Fastboot**
- [ ] **Flash Partition** (recovery, boot, system)
- [ ] **Unlock/Lock Bootloader** (oem unlock)
