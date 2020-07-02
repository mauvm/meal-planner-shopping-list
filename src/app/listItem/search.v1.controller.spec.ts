import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import { assert, match } from 'sinon'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventStore from '../../infra/event.store'
import EventMockStore from '../../infra/event.store.mock'

describe('SearchListItemV1Controller', () => {
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

  describe('should have a GET /v1/lists/:listId/search-items endpoint that', () => {
    it('returns a 404 Not Found on non-existant list', async () => {
      // Data
      const listId = uuid()

      // Execute
      const response = await request(server)
        .get(`/v1/lists/${listId}/unfinished-items`)
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body.message).to.equal(`No list found for ID "${listId}"`)
    })

    it('returns a 200 OK with list of items on success', async () => {
      // Data
      const query = 'hello'

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const titles = ['Foo', 'Bar', 'Hello', 'Hello world']

      for (const title of titles) {
        await request(server)
          .post(`/v1/lists/${listId}/items`)
          .send({
            title,
          })
          .expect(HttpStatus.CREATED)
      }

      // Execute
      const { body } = await request(server)
        .get(`/v1/lists/${listId}/search-items`)
        .query({ query })
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(body.data).to.be.an('array').with.length(2)
      assert.match(
        body.data,
        match([match({ title: 'Hello world' }), match({ title: 'Hello' })]),
      )
    })
  })
})
