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

export type DeviceControlTapInputs = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

export type DeviceControlSwipeInputs = {
  x: number;
  x2: number;
  y: number;
  y2: number;
  scaleX: number;
  scaleY: number;
  duration: number;
};

export type DeviceControlTextInputs = {
  text: string;
};

export type DeviceControlKeyCodeInputs = {
  keycode: string;
};
