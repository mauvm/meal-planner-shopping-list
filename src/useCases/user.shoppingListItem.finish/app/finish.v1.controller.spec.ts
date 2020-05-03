import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemCreated from '../../user.shoppingListItem.create/domain/shoppingListItemCreated.event'
import ShoppingListItemFinished from '../domain/shoppingListItemFinished.event'
import EventStore from '../../../shared/infra/event.store'
import EventMockStore from '../../../shared/infra/event.store.mock'

describe('FinishShoppingListItemV1Controller', () => {
  let server: Server
  let config: ConfigService
  let eventStore: EventStore

  beforeEach(async () => {
    clearContainerInstances(container)

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

  describe('should have a POST /v1/shopping-lists/items/:id/finish endpoint that', () => {
    it('returns a 204 No Content on success', async () => {
      // Data
      const id = uuid()
      const data = {
        id,
        title: 'Test',
        createdAt: new Date().toISOString(),
      }
      const createdEvent = new ShoppingListItemCreated(id, data)

      // Dependencies
      const shoppingListItemStore = container.resolve(ShoppingListItemStore)
      shoppingListItemStore.handleEvent(createdEvent)

      // Execute
      await request(server)
        .post(`/v1/shopping-lists/items/${id}/finish`)
        .expect(HttpStatus.NO_CONTENT)

      // Test
      const aggregate = shoppingListItemStore.getAggregateById(id)
      expect(aggregate?.events).to.be.an('array').with.length(2)
      expect(aggregate?.events[1]).to.be.instanceOf(ShoppingListItemFinished)
      expect(aggregate?.data?.finishedAt).to.be.a('string').that.is.not.empty
    })

    // @todo Write test for non existant ID
  })
})
