import { Server } from 'http'
import { container } from 'tsyringe'
import Koa from 'koa'
import {
  createKoaServer,
  useContainer,
  getMetadataArgsStorage,
} from 'routing-controllers'
import LoggerService from './useCases/dev.logging/domain/logger.service'

function logRegisteredControllers(prefix: string) {
  const logger = container.resolve(LoggerService)

  for (const { target, route } of getMetadataArgsStorage().controllers) {
    logger.debug(`Found registered controller ${target.name}`, {
      controller: target.name,
      route: `${prefix}${route}`,
    })
  }
}

export async function createApp(): Promise<Koa> {
  useContainer({
    get: container.resolve.bind(container),
  })

  const prefix = '/api'
  const app = createKoaServer({
    routePrefix: prefix,
    controllers: [__dirname + '/useCases/*/app/**/*.controller.{js,ts}'],
    classTransformer: true,
  }) as Koa

  logRegisteredControllers(prefix)

  return app
}

export async function cleanUpApp(server: Server) {
  server.close()
}
