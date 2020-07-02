import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventMockStore from '../../infra/event.store.mock'
import EventStore from '../../infra/event.store'

describe('ListUnfinishedListItemV1Controller', () => {
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

  describe('should have a GET /v1/lists/:listId/unfinished-items endpoint that', () => {
    it('returns a 404 Not Found on non-existant list', async () => {
      // Data
      const listId = uuid()

      // Execute
      const response = await request(server)
        .get(`/v1/lists/${listId}/unfinished-items`)
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body.message).to.equal(`No list found for ID "${listId}"`)
    })

    it('returns a 200 OK with unfinished list items', async () => {
      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({ title: 'Item 1' })
        .expect(HttpStatus.CREATED)
      const itemId1 = response2.body.id

      const response3 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({ title: 'Item 2' })
        .expect(HttpStatus.CREATED)
      const itemId2 = response3.body.id

      const response4 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .send({ title: 'Item 3' })
        .expect(HttpStatus.CREATED)
      const itemId3 = response4.body.id

      await request(server)
        .post(`/v1/lists/${listId}/items/${itemId2}/finish`)
        .expect(HttpStatus.NO_CONTENT)

      // Execute
      const response5 = await request(server)
        .get(`/v1/lists/${listId}/unfinished-items`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response5.body?.data).to.be.an('array').with.length(2)
      expect(response5.body?.data.map((item: any) => item.id)).to.deep.equal([
        itemId3,
        itemId1,
      ])
    })
  })
})
