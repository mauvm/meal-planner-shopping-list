import 'mocha' // @todo Find out why VSCode gives "Cannot find name 'describe'." error without this
import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import EventStore from '../../../shared/infra/event.store'
import EventMockStore from '../../../shared/infra/event.store.mock'

describe('CreateShoppingListItemV1Controller', () => {
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

  describe('should have a POST /v1/shopping-lists/items endpoint that', () => {
    it('returns a 303 See Other with location header containing the ID', async () => {
      // Dependencies
      const shoppingListItemStore = container.resolve(ShoppingListItemStore)

      // Execute
      const response = await request(server)
        .post('/v1/shopping-lists/items')
        .send({ title: 'Test' })
        .expect(HttpStatus.SEE_OTHER)

      // Test
      expect(response.header.location).to.include('/v1/shopping-lists/items/')
      const id = response.header['x-resource-id']
      expect(shoppingListItemStore.getAggregateById(id)?.data?.title).to.equal(
        'Test',
      )
    })
  })
})
