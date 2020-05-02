import { singleton } from 'tsyringe'
import winston from 'winston'
import { SPLAT } from 'triple-beam'
import YAML from 'yaml'
import { highlight } from 'cli-highlight'
import ConfigService from './config.service'

@singleton()
export default class LoggerService {
  private logger: winston.Logger

  constructor(private config: ConfigService) {
    this.logger = winston.createLogger({
      level: this.config.get<string>('logger.level', 'debug'),
    })

    this.logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.align(),
          winston.format.printf((info) => {
            const { timestamp, level, message } = info
            const args = info[SPLAT] || {}
            const ts = timestamp.slice(0, 19).replace('T', '')
            const meta =
              args[0] &&
              highlight(YAML.stringify(args[0]), {
                language: 'yaml',
                ignoreIllegals: true,
              })

            return `${ts} [${level}]: ${message}${meta ? '\n' + meta : ''}`
          }),
        ),
      }),
    )
  }

  debug(message: string, meta?: { [key: string]: any }): void {
    this.logger.debug(message, meta)
  }

  info(message: string, meta?: { [key: string]: any }): void {
    this.logger.info(message, meta)
  }

  warn(message: string, meta?: { [key: string]: any }): void {
    this.logger.warn(message, meta)
  }

  error(message: string, meta?: { [key: string]: any }): void {
    this.logger.error(message, meta)
  }
}
