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

  describe('should have a "setLabels" method that', () => {
    it('resolves when item labels have been updated', async () => {
      // Data
      const id = uuid()
      const labels = ['Foo', 'Bar']

      // Dependencies
      const setLabels = stub(repository, 'setLabels').resolves()

      // Execute
      const promise = service.setLabels(id, labels)

      // Test
      await expect(promise).to.eventually.be.fulfilled
      assert.calledOnceWithExactly(setLabels, id, labels)
    })
  })
})
