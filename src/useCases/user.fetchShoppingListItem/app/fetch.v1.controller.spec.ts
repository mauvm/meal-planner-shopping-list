import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../dev.config/domain/config.service'

describe('ShoppingListItemFetchV1Controller', () => {
  let server: Server
  let config: ConfigService

  beforeEach(async () => {
    config = container.resolve(ConfigService)
    config.set('logger.level', 'warn')

    const app = await createApp()
    server = app.listen()
  })

  afterEach(async () => {
    await cleanUpApp(server)
  })

  describe('should have a GET /api/v1/shopping-lists/items/:id endpoint that', () => {
    it('returns a 200 OK with shopping list item', async () => {
      // Data
      const id = uuid()

      // Execute
      const response = await request(server)
        .get(`/api/v1/shopping-lists/items/${id}`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body).to.be.an('object')
    })
  })
})
