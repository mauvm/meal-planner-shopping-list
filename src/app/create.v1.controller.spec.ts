import 'mocha' // @todo Find out why VSCode gives "Cannot find name 'describe'." error without this
import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../app'
import ConfigService from '../domain/config.service'
import ListItemStore from '../infra/listItem.store'
import EventStore from '../infra/event.store'
import EventMockStore from '../infra/event.store.mock'

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

  describe('should have a POST /v1/lists/items endpoint that', () => {
    it('returns a 400 Bad Request on a title that is too long (over 300 characters)', async () => {
      // Data
      const tooLongTitle = Array(301).fill('a').join('')

      // Execute
      const response = await request(server)
        .post('/v1/lists/items')
        .send({ title: tooLongTitle })
        .expect(HttpStatus.BAD_REQUEST)

      // Test
      const constraint = response.body?.errors?.[0]
      expect(constraint.property).to.equal('title')
      expect(constraint.constraints).to.deep.equal({
        maxLength: 'title must be shorter than or equal to 300 characters',
      })
    })

    it('returns a 201 Created with new item ID', async () => {
      // Dependencies
      const listItemStore = container.resolve(ListItemStore)

      // Execute
      const response = await request(server)
        .post('/v1/lists/items')
        .send({ title: 'Test' })
        .expect(HttpStatus.CREATED)

      // Test
      const id = response.header['x-resource-id']
      expect(id).to.be.a('string').that.is.not.empty
      expect(response.body).to.deep.equal({ id })
      expect(listItemStore.getAggregateById(id)?.data?.title).to.equal('Test')
    })

    it('returns a 201 Created with new item that has given labels', async () => {
      // Dependencies
      const listItemStore = container.resolve(ListItemStore)

      // Execute
      const response = await request(server)
        .post('/v1/lists/items')
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
