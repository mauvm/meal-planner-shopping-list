import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import ListItemLabelsChanged from '../../domain/listItem/listItemLabelsChanged.event'
import EventStore from '../../infra/event.store'
import EventMockStore from '../../infra/event.store.mock'
import ListItemStore from '../../infra/listItem/listItem.store'

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

  describe('should have a PUT /v1/lists/:listId/items/:itemId/labels endpoint that', () => {
    it('returns a 404 Not Found on non-existant list', async () => {
      // Data
      const unknownListId = uuid()

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const itemId = response2.body.id

      // Execute
      const response3 = await request(server)
        .put(`/v1/lists/${unknownListId}/items/${itemId}/labels`)
        .send({ labels: ['Foo', 'Bar'] })
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response3.body.message).to.equal(
        `No list item found for ID "${itemId}"`,
      )
    })

    it('returns a 404 Not Found on non-existant list item', async () => {
      // Data
      const itemId = uuid()

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      // Execute
      const response2 = await request(server)
        .put(`/v1/lists/${listId}/items/${itemId}/labels`)
        .send({ labels: ['Foo', 'Bar'] })
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response2.body.message).to.equal(
        `No list item found for ID "${itemId}"`,
      )
    })

    it('returns a 204 No Content on success', async () => {
      // Dependencies
      const listItemStore = container.resolve(ListItemStore)

      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const itemId = response2.body.id

      // Execute
      await request(server)
        .put(`/v1/lists/${listId}/items/${itemId}/labels`)
        .send({ labels: ['Foo', 'Bar'] })
        .expect(HttpStatus.NO_CONTENT)

      // Test
      const aggregate = listItemStore.getAggregateById(itemId)
      expect(aggregate?.events).to.be.an('array').with.length(2)
      expect(aggregate?.events[1]).to.be.instanceOf(ListItemLabelsChanged)
      expect(aggregate?.data?.title).to.equal('Test')
      expect(aggregate?.data?.labels).to.deep.equal(['Bar', 'Foo'])
    })
  })
})
