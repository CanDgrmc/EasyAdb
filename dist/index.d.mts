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

type DeviceProps_CacheEntry<T> = CacheEntry<T>;
type DeviceProps_DeviceMemory = DeviceMemory;
type DeviceProps_StorageInfo = StorageInfo;
declare namespace DeviceProps {
  export type { DeviceProps_CacheEntry as CacheEntry, DeviceProps_DeviceMemory as DeviceMemory, DeviceProps_StorageInfo as StorageInfo };
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
    private getCached;
    private setCached;
    getName(): Promise<string | null>;
    getDeviceMemory(): Promise<DeviceMemory | null>;
    getStorage(): Promise<StorageInfo[] | null>;
    getAllProps(props?: string[]): Promise<string | {
        [key: string]: string;
    } | null>;
    getDeviceId(): string;
    getAndroidVersion(): Promise<string | null>;
    getScreenState(): Promise<string | null>;
    getScreenResolution(): Promise<string | null>;
    getManufacturer(): Promise<string | null>;
    getBrand(): Promise<string | null>;
    getSDKVersion(): Promise<string | null>;
    getScreenDensity(): Promise<string | null>;
    getSystemLanguage(): Promise<string | null>;
    getLocale(): Promise<string | null>;
    getModel(): Promise<string | null>;
    disableLauncher(): Promise<string | null>;
    enableLauncher(): Promise<string | null>;
    enableSystemUI(): Promise<string | null>;
    disableSystemUI(): Promise<string | null>;
    pull(path: string, to: string): Promise<void>;
    push(path: string | ReadStream, remotePath: string, onProgress?: (transferred: number, total?: number) => void): Promise<boolean>;
    toggleScreen(): Promise<string | null>;
    setHomeApp(app: string): Promise<string | null>;
    clearCache(app: string): Promise<string | null>;
    ls(path?: string): Promise<string[]>;
    reboot(): Promise<void>;
    uninstall(packagename: string): Promise<void>;
    putSharedConfig(fullAppName: string, key: string, value: any, props: {
        restart: boolean;
    }): Promise<void>;
    removeSharedConfig(fullAppName: string, key: string, value: any, props: {
        restart: boolean;
    }): Promise<void>;
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
