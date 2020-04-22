import { singleton } from 'tsyringe'
import winston from 'winston'

@singleton()
export default class LoggerService {
  private logger: winston.Logger
  constructor() {
    this.logger = winston.createLogger({ level: 'debug' })

    this.logger.add(new winston.transports.Console())
  }

  debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, ...meta)
  }

  info(message: string, ...meta: any[]): void {
    this.logger.info(message, ...meta)
  }

  warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, ...meta)
  }

  error(message: string, ...meta: any[]): void {
    this.logger.error(message, ...meta)
  }
}
