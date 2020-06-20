import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { plainToClass } from 'class-transformer'
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

  describe('should have a "findAllUnfinished" method that', () => {
    it('resolves to ListItemEntity[] that is sorted by createdAt descending', async () => {
      // Data
      const item1 = plainToClass(ListItemEntity, {
        createdAt: new Date(Date.now() - 2000),
      })
      const item2 = plainToClass(ListItemEntity, {
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
