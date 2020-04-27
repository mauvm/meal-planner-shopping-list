import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import ShoppingListItemService from './shoppingListItem.service'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'
import { plainToClass } from 'class-transformer'

describe('ShoppingListItemService', () => {
  let service: ShoppingListItemService
  let repository: ShoppingListItemRepository

  beforeEach(() => {
    clearContainerInstances(container)

    service = container.resolve(ShoppingListItemService)
    repository = container.resolve(ShoppingListItemRepository)
  })

  describe('should have a "findAllUnfinished" method that', () => {
    it('resolves to ShoppingListItemEntity[] that is sorted by createdAt descending', async () => {
      // Data
      const item1 = plainToClass(ShoppingListItemEntity, {
        createdAt: new Date(Date.now() - 2000),
      })
      const item2 = plainToClass(ShoppingListItemEntity, {
        createdAt: new Date(Date.now() - 1000),
      })

      // Dependencies
      const findAllUnfinished = stub(repository, 'findAllUnfinished').resolves([
        item1,
        item2,
      ])

      // Execute
      const promise = service.findAllUnfinished()

      // Test
      await expect(promise).to.eventually.deep.equal([item2, item1])
      assert.calledOnce(findAllUnfinished)
    })
  })
})
