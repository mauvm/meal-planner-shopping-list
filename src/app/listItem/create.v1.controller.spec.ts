import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventStore from '../../infra/event.store'
import EventMockStore from '../../infra/event.store.mock'
import ListItemStore from '../../infra/listItem/listItem.store'

describe('CreateListItemV1Controller', () => {
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

  describe('should have a POST /v1/lists/:listId/items endpoint that', () => {
    const unknownListId = uuid()
    const validJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    let listId: string

    beforeEach(async () => {
      // Dependencies
      const response = await request(server)
        .post('/v1/lists')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
      listId = response.body.id
    })

    it('returns a 401 Unauthorized on missing JWT', async () => {
      // Execute
      const response = await request(server)
        .post(`/v1/lists/${unknownListId}/items`)
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
        .post(`/v1/lists/${unknownListId}/items`)
        .set('Authorization', `Bearer ${invalidJwt}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'Invalid JWT in Authorization header',
      )
    })

    it('returns a 404 Not Found on non-existant list', async () => {
      // Execute
      const response = await request(server)
        .post(`/v1/lists/${unknownListId}/items`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        `No list found for ID "${unknownListId}"`,
      )
    })

    it('returns a 400 Bad Request on a title that is too long (over 300 characters)', async () => {
      // Data
      const tooLongTitle = Array(301).fill('a').join('')

      // Execute
      const response = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: tooLongTitle })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/)

      // Test
      const constraint = response.body?.errors?.[0]
      expect(constraint.property).to.equal('title')
      expect(constraint.constraints).to.deep.equal({
        maxLength: 'title must be shorter than or equal to 300 characters',
      })
    })

    it('returns a 201 Created with new list item ID', async () => {
      // Dependencies
      const listItemStore = container.resolve(ListItemStore)

      // Execute
      const response = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)
        .expect('Content-Type', /json/)

      // Test
      const id = response.header['x-resource-id']
      expect(id).to.be.a('string').that.is.not.empty
      expect(response.body).to.deep.equal({ id })
      expect(listItemStore.getAggregateById(id)?.data?.title).to.equal('Test')
    })

    it('returns a 201 Created with new list item that has given labels', async () => {
      // Dependencies
      const listItemStore = container.resolve(ListItemStore)

      // Execute
      const response = await request(server)
        .post(`/v1/lists/${listId}/items`)
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ title: 'Test', labels: ['Foo ', '\tBar'] })
        .expect(HttpStatus.CREATED)

      // Test
      const id = response.body.id
      expect(id).to.be.a('string').that.is.not.empty
      expect(listItemStore.getAggregateById(id)?.data?.labels).to.deep.equal([
        'Bar',
        'Foo',
      ])
    })
  })
})
