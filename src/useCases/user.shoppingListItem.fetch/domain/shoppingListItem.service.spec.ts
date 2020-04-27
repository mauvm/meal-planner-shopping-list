import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ShoppingListItemService from './shoppingListItem.service'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import clearContainerInstances from '../../../shared/infra/clearContainerInstances.util'

describe('ShoppingListItemService', () => {
  let service: ShoppingListItemService
  let repository: ShoppingListItemRepository

  beforeEach(() => {
    clearContainerInstances(container)

    service = container.resolve(ShoppingListItemService)
    repository = container.resolve(ShoppingListItemRepository)
  })

  describe('should have a "findOneByIdOrFail" method that', () => {
    const id = uuid()

    it('resolves to a ShoppingListItemEntity when found for given ID', async () => {
      // Data
      const item = container.resolve(ShoppingListItemEntity)

      // Dependencies
      const findOne = stub(repository, 'findOne').resolves(item)

      // Execute
      const promise = service.findOneByIdOrFail(id)

      // Test
      await expect(promise).to.eventually.equal(item)
      assert.calledOnceWithExactly(findOne, id)
    })

    it('rejects with an error when no ShoppingListItemEntity is found for given ID', async () => {
      // Dependencies
      const findOne = stub(repository, 'findOne').resolves(undefined)

      // Execute
      const promise = service.findOneByIdOrFail(id)

      // Test
      await expect(promise).to.eventually.be.rejectedWith(
        `Shopping list item "${id}" not found!`,
      )
      assert.calledOnceWithExactly(findOne, id)
    })
  })
})
