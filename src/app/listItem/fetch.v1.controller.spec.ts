import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventMockStore from '../../infra/event.store.mock'
import EventStore from '../../infra/event.store'

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

  describe('should have a GET /v1/lists/:listId/items/:itemId endpoint that', () => {
    it('returns a 404 Not Found on non-existant list', async () => {
      // Data
      const unknownListId = uuid()

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const itemId = response2.body.id

      // Execute
      const response3 = await request(server)
        .get(`/v1/lists/${unknownListId}/items/${itemId}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response3.body.message).to.equal(
        `No list item found for ID "${itemId}"`,
      )
    })

    it('returns a 404 Not Found on non-existant list item', async () => {
      // Data
      const itemId = uuid()

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      // Execute
      const response2 = await request(server)
        .get(`/v1/lists/${listId}/items/${itemId}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response2.body.message).to.equal(
        `No list item found for ID "${itemId}"`,
      )
    })

    it('returns a 200 OK with list item', async () => {
      // Data
      const data = { title: 'Test' }

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send(data)
        .expect(HttpStatus.CREATED)
      const itemId = response2.body.id

      // Execute
      const response3 = await request(server)
        .get(`/v1/lists/${listId}/items/${itemId}`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      const item = response3.body?.data
      expect(item?.id).to.equal(itemId)
      expect(item?.title).to.equal(data.title)
    })
  })
})
