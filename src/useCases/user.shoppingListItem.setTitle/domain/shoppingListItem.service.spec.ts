import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ShoppingListItemService from './shoppingListItem.service'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

describe('ShoppingListItemService', () => {
  let service: ShoppingListItemService
  let repository: ShoppingListItemRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ShoppingListItemService)
    repository = container.resolve(ShoppingListItemRepository)
  })

  describe('should have a "setTitle" method that', () => {
    it('resolves when item labels have been updated', async () => {
      // Data
      const id = uuid()
      const title = 'Other title'

      // Dependencies
      const setTitle = stub(repository, 'setTitle').resolves()

      // Execute
      const promise = service.setTitle(id, title)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(setTitle, id, title)
    })
  })
})
