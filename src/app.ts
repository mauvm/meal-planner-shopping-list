import { Server } from 'http'
import { container } from 'tsyringe'
import Koa from 'koa'
import {
  createKoaServer,
  useContainer,
  getMetadataArgsStorage,
} from 'routing-controllers'
import LoggerService from './shared/domain/logger.service'

function debugRegisteredControllers() {
  const logger = container.resolve(LoggerService)

  for (const { target, route } of getMetadataArgsStorage().controllers) {
    logger.debug(`Found registered controller: ${target.name}`, {
      controller: target.name,
      route,
    })
  }
}

export async function createApp(): Promise<Koa> {
  // Register IoC/DI container
  useContainer({
    get: container.resolve.bind(container),
  })

  const app = createKoaServer({
    controllers: [__dirname + '/useCases/*/app/**/*.controller.{js,ts}'],
    classTransformer: true,
  }) as Koa

  debugRegisteredControllers()

  return app
}

export async function cleanUpApp(server: Server) {
  server.close()
}
