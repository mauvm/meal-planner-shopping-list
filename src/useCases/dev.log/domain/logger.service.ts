import { singleton } from 'tsyringe'
import winston from 'winston'
import ConfigService from '../../dev.config/domain/config.service'

@singleton()
export default class LoggerService {
  private logger: winston.Logger

  constructor(private config: ConfigService) {
    this.logger = winston.createLogger({
      level: this.config.get<string>('logger.level', 'debug'),
    })

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
