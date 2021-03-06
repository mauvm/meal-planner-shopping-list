import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { v4 as uuid } from 'uuid'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventMockStore from '../../infra/event.store.mock'
import EventStore from '../../infra/event.store'

describe('FetchListItemV1Controller', () => {
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

  describe('should have a GET /v1/lists/:listId/items/:itemId endpoint that', () => {
    const unknownListId = uuid()
    const unknownItemId = uuid()
    const validJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    it('returns a 401 Unauthorized on missing JWT', async () => {
      // Execute
      const response = await request(server)
        .get(`/v1/lists/${unknownListId}/items/${unknownItemId}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'Missing Bearer JWT in Authorization header',
      )
    })

    it('returns a 401 Unauthorized on invalid JWT', async () => {
      // Data
      const invalidJwt = 'invalid.invalid.invalid'

      // Execute
      const response = await request(server)
        .get(`/v1/lists/${unknownListId}/items/${unknownItemId}`)
        .set('Authorization', `Bearer ${invalidJwt}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'Invalid JWT in Authorization header',
      )
    })

    it('returns a 401 Unauthorized on missing list ownership', async () => {
      // Data
      const otherValidJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvdGhlciIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.gVRPwD0kSNUdia7EKghYxEJ6UlrPsvfusEjwznXMAkY'

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .set('Authorization', `Bearer ${otherValidJwt}`)
        .send({
          title: 'Test',
        })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      // Execute
      const response2 = await request(server)
        .get(`/v1/lists/${listId}/items/${unknownItemId}`)
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/)

      // Test
      expect(response2.body?.message).to.equal(`No access to list "${listId}"`)
    })

    it('returns a 404 Not Found on non-existant list', async () => {
      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const itemId = response2.body.id

      // Execute
      const response3 = await request(server)
        .get(`/v1/lists/${unknownListId}/items/${itemId}`)
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response3.body.message).to.equal(
        `No list found for ID "${unknownListId}"`,
      )
    })

    it('returns a 404 Not Found on non-existant list item', async () => {
      // Data
      const itemId = uuid()

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      // Execute
      const response2 = await request(server)
        .get(`/v1/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response2.body.message).to.equal(
        `No list item found for ID "${itemId}"`,
      )
    })

    it('returns a 200 OK with list item', async () => {
      // Data
      const data = { title: 'Test' }

      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      const listId = response.body.id

      const response2 = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send(data)
        .expect(HttpStatus.CREATED)
      const itemId = response2.body.id

      // Execute
      const response3 = await request(server)
        .get(`/v1/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      const item = response3.body?.data
      expect(item?.id).to.equal(itemId)
      expect(item?.title).to.equal(data.title)
    })
  })
})
