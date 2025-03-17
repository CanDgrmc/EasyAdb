export type DeviceMemory = {
  totalMemory: number;
  memFree: number;
  memUsed: number;
};

export type StorageInfo = {
  Path: string;
  kBlock: string;
  Used: number;
  Available: number;
  UsePercentage: string;
  MountedOn: string;
};

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
}
