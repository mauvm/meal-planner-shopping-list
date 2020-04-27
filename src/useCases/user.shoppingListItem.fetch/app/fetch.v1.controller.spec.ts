import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'

describe('FetchShoppingListItemV1Controller', () => {
  let server: Server
  let config: ConfigService

  beforeEach(async () => {
    clearContainerInstances(container)

    config = container.resolve(ConfigService)
    config.set('logger.level', 'warn')

    const app = await createApp()
    server = app.listen()
  })

  afterEach(async () => {
    await cleanUpApp(server)
  })

  describe('should have a GET /v1/shopping-lists/items/:id endpoint that', () => {
    it('returns a 200 OK with shopping list item', async () => {
      // Data
      const id = uuid()

      // Execute
      const response = await request(server)
        .get(`/v1/shopping-lists/items/${id}`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.data).to.be.an('object')
      expect(response.body.data.id).to.be.a('string').that.is.not.empty
      expect(response.body.data.title).to.be.a('string').that.is.not.empty
    })
  })
})
