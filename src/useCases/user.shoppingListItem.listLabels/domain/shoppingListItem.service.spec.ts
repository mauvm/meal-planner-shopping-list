import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
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

  describe('should have a "listLabels" method that', () => {
    it('resolves when item labels have been updated', async () => {
      // Data
      const labels = ['Bar', 'Foo']

      // Dependencies
      const listLabels = stub(repository, 'listLabels').returns(labels)

      // Execute
      const result = service.listLabels()

      // Test
      expect(result).to.deep.equal(labels)
      assert.calledOnce(listLabels)
    })
  })
})
