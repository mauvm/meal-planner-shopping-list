import { singleton } from 'tsyringe'
import { constantCase } from 'constant-case'

@singleton()
export default class ConfigService {
  private internal = new Map<string, any>()

  set(path: string, value: any): void {
    this.internal.set(path, value)
  }

  get<T = string>(path: string, defaultTo: T | undefined = undefined): T {
    return this.internal.get(path) ?? this.getFromEnv(path) ?? defaultTo
  }

  private getFromEnv(path: string): string | undefined {
    return process.env[constantCase(path)]
  }
}
