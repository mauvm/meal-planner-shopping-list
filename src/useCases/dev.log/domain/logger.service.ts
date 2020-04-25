import { singleton } from 'tsyringe'
import winston from 'winston'
import { SPLAT } from 'triple-beam'
import YAML from 'yaml'
import { highlight } from 'cli-highlight'
import ConfigService from '../../dev.config/domain/config.service'

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

            return `${ts} [${level}]: ${message}${
              Object.keys(args).length
                ? '\n' +
                  highlight(YAML.stringify(args), {
                    language: 'yaml',
                    ignoreIllegals: true,
                  })
                : ''
            }`
          }),
        ),
      }),
    )
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
