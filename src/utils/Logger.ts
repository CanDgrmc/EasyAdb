import type { ILoggerOptions } from "../types/logger/LoggerOptions";
import { execIf } from "./FnHelpers";
import { prefixed } from "./StrHelper";

export default class Logger {
  opts: ILoggerOptions = {
    silent: false,
    prefix: "ADB",
  };
  constructor(opts: ILoggerOptions) {
    if (opts.prefix) {
      this.opts.prefix = opts.prefix;
    }
    if (opts.silent) {
      this.opts.silent = opts.silent;
    }
  }
  public static log(...args: any[]): void {
    console.log(...args);
  }
  public static warn(...args: any[]): void {
    console.warn(...args);
  }
  public static error(...args: any[]): void {
    console.error(...args);
  }
  public static info(...args: any[]): void {
    console.info(...args);
  }
  public static debug(...args: any[]): void {
    console.debug(...args);
  }
  public static trace(...args: any[]): void {
    console.trace(...args);
  }
  public static dir(...args: any[]): void {
    console.dir(...args);
  }
  public static group(...args: any[]): void {
    console.group(...args);
  }

  public log(...args: any[]): void {
    execIf(
      !this.opts.silent,
      console.log,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  public warn(...args: any[]): void {
    execIf(
      !this.opts.silent,
      console.warn,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  public error(...args: any[]): void {
    execIf(
      !this.opts.silent,
      console.error,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  public info(...args: any[]): void {
    execIf(
      !this.opts.silent,
      console.info,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  public debug(...args: any[]): void {
    execIf(
      !this.opts.silent,
      console.debug,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
  public trace(...args: any[]): void {
    execIf(
      !this.opts.silent,
      console.trace,
      ...prefixed(this.opts.prefix, ...args)
    );
  }
}
