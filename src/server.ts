import 'reflect-metadata'
import { container } from 'tsyringe'
import { createApp } from './app'
import LoggerService from './shared/domain/logger.service'

async function run() {
  try {
    const port = Number(process.env.PORT) || 3000
    const app = await createApp()

    // Weirdly enough Koa's listen method uses a callback
    await new Promise((resolve) => app.listen(port, resolve))

    const logger = container.resolve(LoggerService)
    logger.info(`Listening on port ${port}..`, { port })
  } catch (err) {
    const logger = container.resolve(LoggerService)
    logger.error('Uncaught error:', err)

    process.exit(1)
  }
}

run()
