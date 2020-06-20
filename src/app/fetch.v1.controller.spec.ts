import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../app'
import ConfigService from '../domain/config.service'
import ListItemStore from '../infra/listItem.store'
import ListItemCreated from '../domain/listItemCreated.event'
import EventMockStore from '../infra/event.store.mock'
import EventStore from '../infra/event.store'

describe('FetchListItemV1Controller', () => {
  let server: Server
  let config: ConfigService
  let eventStore: EventStore

  beforeEach(async () => {
    container.clearInstances()

    config = container.resolve(ConfigService)
    config.set('logger.level', 'warn')

    eventStore = container.resolve(EventMockStore)
    container.registerInstance(EventStore, eventStore)

    const app = await createApp()
    server = app.listen()
  })

  afterEach(async () => {
    await cleanUpApp(server)
  })

  describe('should have a GET /v1/lists/items/:id endpoint that', () => {
    it('returns a 400 Bad Request on non-existant item', async () => {
      // Data
      const id = uuid()

      // Execute
      const response = await request(server)
        .get(`/v1/lists/items/${id}`)
        .expect(HttpStatus.BAD_REQUEST)

      // Test
      expect(response.body.message).to.equal(
        `No list item found for ID "${id}"`,
      )
    })

    it('returns a 200 OK with list item', async () => {
      // Data
      const id = uuid()
      const data = { title: 'Test' }
      const createdEvent = new ListItemCreated('1', id, data)

      // Dependencies
      const listItemStore = container.resolve(ListItemStore)
      listItemStore.handleEvent(createdEvent)

      // Execute
      const response = await request(server)
        .get(`/v1/lists/items/${id}`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      const item = response.body?.data
      expect(item?.id).to.equal(id)
      expect(item?.title).to.equal(data.title)
    })
  })
})
