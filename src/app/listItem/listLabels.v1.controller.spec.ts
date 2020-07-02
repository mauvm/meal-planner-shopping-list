import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventStore from '../../infra/event.store'
import EventMockStore from '../../infra/event.store.mock'

describe('ListItemLabelsV1Controller', () => {
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

  describe('should have a GET /v1/lists/:listId/items-labels endpoint that', () => {
    it('returns a 200 OK with list of labels on success', async () => {
      // Data
      const labels = ['Foo', 'Bar']

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({
          title: 'Test',
          labels,
        })
        .expect(HttpStatus.CREATED)

      // Execute
      const { body } = await request(server)
        .get(`/v1/lists/${listId}/items-labels`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(body).to.deep.equal({ data: labels.sort() })
    })
  })
})
