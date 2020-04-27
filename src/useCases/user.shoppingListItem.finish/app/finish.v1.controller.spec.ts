import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../../app'
import ConfigService from '../../../shared/domain/config.service'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import { plainToClass } from 'class-transformer'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import temporaryDatabase from '../../../shared/infra/temporaryDatabase'

describe('FinishShoppingListItemV1Controller', () => {
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

  describe('should have a POST /v1/shopping-lists/items/:uuid/finish endpoint that', () => {
    it('returns a 204 No Content on success', async () => {
      // Data
      const id = uuid()
      const item = plainToClass(ShoppingListItemEntity, {
        uuid: id,
        title: 'Test',
      })

      // Dependencies
      temporaryDatabase.shoppingListItems.set(id, item)

      // Execute
      await request(server)
        .post(`/v1/shopping-lists/items/${id}/finish`)
        .expect(HttpStatus.NO_CONTENT)

      // Test
      expect(item.finishedAt).to.be.an.instanceOf(Date)
    })
  })
})
