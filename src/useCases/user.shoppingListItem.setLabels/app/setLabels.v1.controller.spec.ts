import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import ShoppingListItemLabelsChanged from '../domain/shoppingListItemLabelsChanged.event'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import EventStore from '../../../shared/infra/event.store'
import EventMockStore from '../../../shared/infra/event.store.mock'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'

describe('FinishShoppingListItemV1Controller', () => {
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

  describe('should have a POST /v1/shopping-lists/items/:id/set-labels endpoint that', () => {
    it('returns a 204 No Content on success', async () => {
      // Dependencies
      const shoppingListItemStore = container.resolve(ShoppingListItemStore)
      const response = await request(server)
        .post('/v1/shopping-lists/items')
        .send({ title: 'Test' })
        .expect(HttpStatus.SEE_OTHER)
      const id = response.header['x-resource-id']

      // Execute
      await request(server)
        .post(`/v1/shopping-lists/items/${id}/set-labels`)
        .send({ labels: ['Foo', 'Bar'] })
        .expect(HttpStatus.NO_CONTENT)

      // Test
      const aggregate = shoppingListItemStore.getAggregateById(id)
      expect(aggregate?.events).to.be.an('array').with.length(2)
      expect(aggregate?.events[1]).to.be.instanceOf(
        ShoppingListItemLabelsChanged,
      )
      expect(aggregate?.data?.title).to.equal('Test')
      expect(aggregate?.data?.labels).to.deep.equal(['Bar', 'Foo'])
    })

    // @todo Write test for non existant ID
  })
})
