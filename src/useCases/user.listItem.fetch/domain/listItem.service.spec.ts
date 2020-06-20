import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ListItemService from './listItem.service'
import ListItemRepository from '../infra/listItem.repository'
import ListItemEntity from '../../../shared/domain/listItem.entity'

describe('ListItemService', () => {
  let service: ListItemService
  let repository: ListItemRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ListItemService)
    repository = container.resolve(ListItemRepository)
  })

  describe('should have a "findOneByIdOrFail" method that', () => {
    const id = uuid()

    it('resolves to a ListItemEntity when found for given ID', async () => {
      // Data
      const item = container.resolve(ListItemEntity)

      // Dependencies
      const findOneOrFail = stub(repository, 'findOneOrFail').resolves(item)

      // Execute
      const promise = service.findOneByIdOrFail(id)

      // Test
      await expect(promise).to.eventually.equal(item)
      assert.calledOnceWithExactly(findOneOrFail, id)
    })
  })
})
