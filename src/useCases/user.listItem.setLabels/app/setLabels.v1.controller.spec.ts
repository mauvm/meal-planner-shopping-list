import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import ListItemLabelsChanged from '../domain/listItemLabelsChanged.event'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import EventStore from '../../../shared/infra/event.store'
import EventMockStore from '../../../shared/infra/event.store.mock'
import ListItemStore from '../../../shared/infra/listItem.store'

describe('SetListItemLabelsV1Controller', () => {
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

  describe('should have a POST /v1/lists/items/:id/set-labels endpoint that', () => {
    it('returns a 400 Bad Request on non-existant item', async () => {
      // Data
      const id = uuid()

      // Execute
      const response = await request(server)
        .post(`/v1/lists/items/${id}/set-labels`)
        .send({ labels: ['Foo', 'Bar'] })
        .expect(HttpStatus.BAD_REQUEST)

      // Test
      expect(response.body.message).to.equal(
        `No list item found for ID "${id}"`,
      )
    })

    it('returns a 204 No Content on success', async () => {
      // Dependencies
      const listItemStore = container.resolve(ListItemStore)
      const response = await request(server)
        .post('/v1/lists/items')
        .send({ title: 'Test' })
        .expect(HttpStatus.SEE_OTHER)
      const id = response.header['x-resource-id']

      // Execute
      await request(server)
        .post(`/v1/lists/items/${id}/set-labels`)
        .send({ labels: ['Foo', 'Bar'] })
        .expect(HttpStatus.NO_CONTENT)

      // Test
      const aggregate = listItemStore.getAggregateById(id)
      expect(aggregate?.events).to.be.an('array').with.length(2)
      expect(aggregate?.events[1]).to.be.instanceOf(ListItemLabelsChanged)
      expect(aggregate?.data?.title).to.equal('Test')
      expect(aggregate?.data?.labels).to.deep.equal(['Bar', 'Foo'])
    })
  })
})
