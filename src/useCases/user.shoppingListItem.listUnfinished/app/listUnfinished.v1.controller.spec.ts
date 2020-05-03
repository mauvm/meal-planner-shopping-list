import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemCreated from '../../user.shoppingListItem.create/domain/shoppingListItemCreated.event'
import EventMockStore from '../../../shared/infra/event.store.mock'
import EventStore from '../../../shared/infra/event.store'

describe('ListUnfinishedShoppingListItemV1Controller', () => {
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

  describe('should have a GET /v1/shopping-lists/unfinished-items endpoint that', () => {
    it('returns a 200 OK with unfinished shopping list items', async () => {
      // Data
      const id1 = uuid()
      const id2 = uuid()
      const event1 = new ShoppingListItemCreated(id1, { title: 'Item 1' })

      await new Promise((resolve) => setTimeout(resolve, 10)) // event2 must be after event1
      const event2 = new ShoppingListItemCreated(id2, { title: 'Item 2' })

      // Dependencies
      const shoppingListItemStore = container.resolve(ShoppingListItemStore)
      shoppingListItemStore.handleEvent(event1)
      shoppingListItemStore.handleEvent(event2)

      // Execute
      const response = await request(server)
        .get('/v1/shopping-lists/unfinished-items')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.data).to.be.an('array').with.length(2)
      expect(response.body?.data.map((item: any) => item.id)).to.deep.equal([
        id2,
        id1,
      ])
    })
  })
})
