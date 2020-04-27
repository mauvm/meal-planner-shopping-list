import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'

describe('CreateShoppingListItemV1Controller', () => {
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

  describe('should have a POST /v1/shopping-lists/items endpoint that', () => {
    it('returns a 200 OK with shopping list item', async () => {
      // Execute
      const response = await request(server)
        .post('/v1/shopping-lists/items')
        .send({ title: 'Test' })
        .expect(HttpStatus.SEE_OTHER)

      // Test
      expect(response.header.location).to.include('/v1/shopping-lists/items/')
    })
  })
})
