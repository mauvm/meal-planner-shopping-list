import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ShoppingListItemService from './shoppingListItem.service'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'

describe('ShoppingListItemService', () => {
  let service: ShoppingListItemService
  let repository: ShoppingListItemRepository

  beforeEach(() => {
    clearContainerInstances(container)

    service = container.resolve(ShoppingListItemService)
    repository = container.resolve(ShoppingListItemRepository)
  })

  describe('should have a "finish" method that', () => {
    it('resolves to an UUID for the finished shopping list item', async () => {
      // Data
      const id = uuid()

      // Dependencies
      const finish = stub(repository, 'finish').resolves()

      // Execute
      const promise = service.finish(id)

      // Test
      await expect(promise).to.eventually.be.fulfilled
      assert.calledOnceWithExactly(finish, id)
    })
  })
})
