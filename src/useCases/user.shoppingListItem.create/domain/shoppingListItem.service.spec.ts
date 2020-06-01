import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
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

  describe('should have a "create" method that', () => {
    it('resolves to an ID for the created shopping list item', async () => {
      // Data
      const id = uuid()
      const title = 'Test'
      let item = plainToClass(ShoppingListItemEntity, { id, title })

      // Dependencies
      const create = stub(repository, 'create').resolves(id)

      // Execute
      const promise = service.create({ title })

      // Test
      await expect(promise).to.eventually.be.equal(id)
      assert.calledOnceWithExactly(create, { title })
      expect(item.id).to.equal(id)
    })

    it('trims the title', async () => {
      // Data
      const id = uuid()
      const title = ' Test '

      // Dependencies
      const create = stub(repository, 'create').resolves(id)

      // Execute
      const promise = service.create({ title })

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(create, { title: 'Test' })
    })
  })
})
