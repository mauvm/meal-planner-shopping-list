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

describe('ListUnfinishedShoppingListItemV1Controller', () => {
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

  describe('should have a GET /v1/shopping-lists/unfinished-items endpoint that', () => {
    it('returns a 200 OK with unfinished shopping list items', async () => {
      // Data
      const item1 = plainToClass(ShoppingListItemEntity, {
        uuid: uuid(),
        title: 'Item 1',
        createdAt: new Date(Date.now() - 2000),
      })
      const item2 = plainToClass(ShoppingListItemEntity, {
        uuid: uuid(),
        title: 'Item 2',
        createdAt: new Date(Date.now() - 1000),
      })

      // Dependencies
      temporaryDatabase.shoppingListItems.clear()
      temporaryDatabase.shoppingListItems.set(item1.uuid, item1)
      temporaryDatabase.shoppingListItems.set(item2.uuid, item2)

      // Execute
      const response = await request(server)
        .get('/v1/shopping-lists/unfinished-items')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.data).to.be.an('array').with.length(2)
      expect(response.body?.data.map((item: any) => item.uuid)).to.deep.equal([
        item2.uuid,
        item1.uuid,
      ])
    })
  })
})
