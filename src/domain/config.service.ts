import { singleton } from 'tsyringe'

@singleton()
export default class ConfigService {
  private internal = new Map<string, any>()

  set(path: string, value: any): void {
    this.internal.set(path, value)
  }

  get<T>(path: string, defaultTo: T): T {
    return this.internal.get(path) ?? defaultTo
  }
}
