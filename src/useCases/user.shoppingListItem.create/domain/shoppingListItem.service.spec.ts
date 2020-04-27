import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ShoppingListItemService from './shoppingListItem.service'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import { plainToClass } from 'class-transformer'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

describe('ShoppingListItemService', () => {
  let service: ShoppingListItemService
  let repository: ShoppingListItemRepository

  beforeEach(() => {
    clearContainerInstances(container)

    service = container.resolve(ShoppingListItemService)
    repository = container.resolve(ShoppingListItemRepository)
  })

  describe('should have a "create" method that', () => {
    it('resolves to an UUID for the created shopping list item', async () => {
      // Data
      const id = uuid()
      const title = 'Test'
      let item = plainToClass(ShoppingListItemEntity, { uuid: id, title })

      // Dependencies
      const create = stub(repository, 'create').resolves(item)

      // Execute
      const promise = service.create({ title })

      // Test
      await expect(promise).to.eventually.be.equal(id)
      assert.calledOnceWithExactly(create, { title })
      expect(item.uuid).to.equal(id)
    })
  })
})
