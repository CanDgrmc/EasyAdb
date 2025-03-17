export interface IAdbClient {
  connect?(host: string, port: number): Promise<boolean>;
  disconnect?(host: string, port: number): Promise<boolean>;
  shell(command: string): Promise<string | null>;
}
