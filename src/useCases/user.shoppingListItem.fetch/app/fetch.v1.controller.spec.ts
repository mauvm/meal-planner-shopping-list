import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import temporaryDatabase from '../../../shared/infra/temporaryDatabase'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

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
      const data = { uuid: id, title: 'Test' }
      const item = plainToClass(ShoppingListItemEntity, data)

      // Dependencies
      temporaryDatabase.shoppingListItems.set(id, item)

      // Execute
      const response = await request(server)
        .get(`/v1/shopping-lists/items/${id}`)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.data).to.deep.equal(data)
    })
  })
})
