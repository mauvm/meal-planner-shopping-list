import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import EventStore from '../../../shared/infra/event.store'
import EventMockStore from '../../../shared/infra/event.store.mock'

describe('ListShoppingListItemLabelsV1Controller', () => {
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

  describe('should have a GET /v1/shopping-lists/list-items-labels endpoint that', () => {
    it('returns a 200 OK with list of labels on success', async () => {
      // Data
      const labels = ['Foo', 'Bar']

      // Dependencies
      const response = await request(server)
        .post('/v1/shopping-lists/items')
        .send({
          title: 'Test',
        })
        .expect(HttpStatus.SEE_OTHER)
      const id = response.header['x-resource-id']

      await request(server)
        .post(`/v1/shopping-lists/items/${id}/set-labels`)
        .send({
          labels,
        })
        .expect(HttpStatus.NO_CONTENT)

      // Execute
      const { body } = await request(server)
        .get('/v1/shopping-lists/list-items-labels')
        .expect(HttpStatus.OK)

      // Test
      expect(body).to.deep.equal({ data: labels.sort() })
    })
  })
})
