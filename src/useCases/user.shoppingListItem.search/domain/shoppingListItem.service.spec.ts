import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import ShoppingListItemService from './shoppingListItem.service'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import { plainToClass } from 'class-transformer'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

describe('ShoppingListItemService', () => {
  let service: ShoppingListItemService
  let repository: ShoppingListItemRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ShoppingListItemService)
    repository = container.resolve(ShoppingListItemRepository)
  })

  describe('should have a "searchItems" method that', () => {
    it('returns list of items that match query', async () => {
      // Data
      const query = 'Foo'
      const item1 = plainToClass(ShoppingListItemEntity, {
        title: 'Foo',
        createdAt: new Date(Date.now() - 2000),
      })
      const item2 = plainToClass(ShoppingListItemEntity, {
        title: 'foo foo',
        createdAt: new Date(Date.now() - 1000),
      })

      // Dependencies
      const searchItems = stub(repository, 'searchItems').returns([
        item1,
        item2,
      ])

      // Execute
      const result = service.searchItems(query)

      // Test
      expect(result).to.deep.equal([item1, item2])
      assert.calledOnceWithExactly(searchItems, query)
    })
  })
})
