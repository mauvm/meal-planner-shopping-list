import path from 'path'
import { Server } from 'http'
import { container } from 'tsyringe'
import Koa from 'koa'
import {
  createKoaServer,
  useContainer,
  getMetadataArgsStorage,
} from 'routing-controllers'
import glob from 'glob'
import LoggerService from './domain/logger.service'
import AutoLoadableStore from './infra/autoLoadableStore.interface'
import BaseStore from './infra/base.store'
import { Event, registerEventClass } from './infra/event.store'

function debugRegisteredControllers() {
  const logger = container.resolve(LoggerService)

  for (const { target, route } of getMetadataArgsStorage().controllers) {
    logger.debug(`Found registered controller: ${target.name}`, {
      controller: target.name,
      route,
    })
  }
}

const loadedStores: AutoLoadableStore[] = []

async function autoLoadStores() {
  const logger = container.resolve(LoggerService)
  const files = glob.sync(path.resolve(__dirname, 'infra/**/*.store.{js,ts}'))

  if (files.length === 0) {
    logger.debug('No stores to initialize')
    return
  }

  for (const file of files) {
    const storeClass = require(file).default

    // @todo Only load classes when they implement AutoLoadableStore
    if (storeClass === BaseStore) {
      continue
    }

    const store = container.resolve(storeClass) as AutoLoadableStore

    logger.debug(`Initializing store: ${store?.constructor?.name}..`, {
      file: path.relative(process.cwd(), file),
    })

    await store.init()
    loadedStores.push(store)
  }
}

async function autoCleanUpStores() {
  for (const store of loadedStores) {
    await store.cleanUp()
  }
}

async function autoRegisterEvents() {
  const logger = container.resolve(LoggerService)
  const files = glob.sync(path.resolve(__dirname, 'domain/**/*.event.{js,ts}'))

  if (files.length === 0) {
    logger.debug('No events to initialize')
    return
  }

  for (const file of files) {
    const eventClass = require(file).default as typeof Event
    registerEventClass(eventClass)

    logger.debug(`Initialized event: ${eventClass.name}`, {
      file: path.relative(process.cwd(), file),
    })
  }
}

export async function createApp(): Promise<Koa> {
  // Register IoC/DI container
  useContainer({
    get: container.resolve.bind(container),
  })

  const app = createKoaServer({
    cors: true,
    controllers: [path.resolve(__dirname, 'app/**/*.controller.{js,ts}')],
    classTransformer: true,
  }) as Koa

  debugRegisteredControllers()
  await autoLoadStores()
  await autoRegisterEvents()

  return app
}

export async function cleanUpApp(server: Server) {
  await autoCleanUpStores()

  server.close()
}
