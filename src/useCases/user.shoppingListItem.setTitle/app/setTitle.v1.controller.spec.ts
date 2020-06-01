import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import ShoppingListItemTitleChanged from '../domain/shoppingListItemTitleChanged.event'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import EventStore from '../../../shared/infra/event.store'
import EventMockStore from '../../../shared/infra/event.store.mock'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'

describe('SetShoppingListItemTitleV1Controller', () => {
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

  describe('should have a PATCH /v1/shopping-lists/items/:id endpoint that', () => {
    it('returns a 400 Bad Request on non-existant item', async () => {
      // Data
      const id = uuid()

      // Execute
      const response = await request(server)
        .patch(`/v1/shopping-lists/items/${id}`)
        .send({ title: 'Other title' })
        .expect(HttpStatus.BAD_REQUEST)

      // Test
      expect(response.body.message).to.equal(
        `No shopping list item found for ID "${id}"`,
      )
    })

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
        .patch(`/v1/shopping-lists/items/${id}`)
        .send({ title: 'Other title' })
        .expect(HttpStatus.NO_CONTENT)

      // Test
      const aggregate = shoppingListItemStore.getAggregateById(id)
      expect(aggregate?.events).to.be.an('array').with.length(2)
      expect(aggregate?.events[1]).to.be.instanceOf(
        ShoppingListItemTitleChanged,
      )
      expect(aggregate?.data?.title).to.equal('Other title')
    })

    // @todo Write test for non existant ID
  })
})
