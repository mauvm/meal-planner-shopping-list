import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { v4 as uuid } from 'uuid'
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
    const unknownListId = uuid()
    const unknownItemId = uuid()
    const validJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    it('returns a 401 Unauthorized on missing JWT', async () => {
      // Execute
      const response = await request(server)
        .put(`/v1/lists/${unknownListId}/items/${unknownItemId}/labels`)
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
        .put(`/v1/lists/${unknownListId}/items/${unknownItemId}/labels`)
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
        .put(`/v1/lists/${listId}/items/${unknownItemId}/labels`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ labels: ['Foo', 'Bar'] })
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
        .put(`/v1/lists/${unknownListId}/items/${itemId}/labels`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ labels: ['Foo', 'Bar'] })
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
        .put(`/v1/lists/${listId}/items/${itemId}/labels`)
        .set('Authorization', `Bearer ${validJwt}`)
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
      await request(server)
        .put(`/v1/lists/${listId}/items/${itemId}/labels`)
        .set('Authorization', `Bearer ${validJwt}`)
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
