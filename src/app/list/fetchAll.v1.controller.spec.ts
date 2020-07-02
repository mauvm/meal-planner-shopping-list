import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import ListCreated from '../../domain/list/listCreated.event'
import EventMockStore from '../../infra/event.store.mock'
import EventStore from '../../infra/event.store'
import ListStore from '../../infra/list/list.store'

describe('FetchAllListV1Controller', () => {
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

  describe('should have a GET /v1/lists endpoint that', () => {
    it('returns a 200 OK with lists', async () => {
      // Data
      const id1 = uuid()
      const id2 = uuid()
      const createdEvent1 = new ListCreated('1', id1, { title: 'List 1' })
      const createdEvent2 = new ListCreated('2', id2, { title: 'List 2' })

      // Dependencies
      const listStore = container.resolve(ListStore)
      listStore.handleEvent(createdEvent1)
      listStore.handleEvent(createdEvent2)

      // Execute
      const response = await request(server)
        .get('/v1/lists')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      const lists = response.body?.data
      expect(lists).to.be.an('array').with.lengthOf(2)
      expect(lists[0]?.id).to.equal(id1)
      expect(lists[1]?.id).to.equal(id2)
    })

    it('returns a 200 OK with lists sorted by oldest first', async () => {
      // Data
      const id1 = uuid()
      const id2 = uuid()
      const createdEvent1 = new ListCreated('1', id1, {
        title: 'List 1',
        createdAt: new Date(Date.now() - 1000).toISOString(),
      })
      const createdEvent2 = new ListCreated('2', id2, {
        title: 'List 2',
        createdAt: new Date(Date.now() - 2000).toISOString(),
      })

      // Dependencies
      const listStore = container.resolve(ListStore)
      listStore.handleEvent(createdEvent1)
      listStore.handleEvent(createdEvent2)

      // Execute
      const response = await request(server)
        .get('/v1/lists')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      const lists = response.body?.data
      expect(lists).to.be.an('array').with.lengthOf(2)
      expect(lists[0]?.id).to.equal(id2)
      expect(lists[1]?.id).to.equal(id1)
    })
  })
})
