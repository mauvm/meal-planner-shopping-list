import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import ShoppingListItemFinished from '../../user.shoppingListItem.finish/domain/shoppingListItemFinished.event'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'
import EventMockStore from '../../../shared/infra/event.store.mock'
import EventStore from '../../../shared/infra/event.store'

describe('ListUnfinishedShoppingListItemV1Controller', () => {
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

  describe('should have a GET /v1/shopping-lists/unfinished-items endpoint that', () => {
    it('returns a 200 OK with unfinished shopping list items', async () => {
      // Data
      const aggregateId1 = uuid()
      const aggregateId2 = uuid()
      const aggregateId3 = uuid()
      const createEvent1 = new ShoppingListItemCreated('1', aggregateId1, {
        title: 'Item 1',
      })
      const createEvent2 = new ShoppingListItemCreated('2', aggregateId2, {
        title: 'Item 2',
      })
      const finishEvent = new ShoppingListItemFinished('3', aggregateId2)

      await new Promise((resolve) => setTimeout(resolve, 10)) // event2 must be after event1
      const createEvent3 = new ShoppingListItemCreated('4', aggregateId3, {
        title: 'Item 3',
      })

      // Dependencies
      const shoppingListItemStore = container.resolve(ShoppingListItemStore)
      shoppingListItemStore.handleEvent(createEvent1)
      shoppingListItemStore.handleEvent(createEvent2)
      shoppingListItemStore.handleEvent(finishEvent)
      shoppingListItemStore.handleEvent(createEvent3)

      // Execute
      const response = await request(server)
        .get('/v1/shopping-lists/unfinished-items')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.data).to.be.an('array').with.length(2)
      expect(response.body?.data.map((item: any) => item.id)).to.deep.equal([
        aggregateId3,
        aggregateId1,
      ])
    })
  })
})
