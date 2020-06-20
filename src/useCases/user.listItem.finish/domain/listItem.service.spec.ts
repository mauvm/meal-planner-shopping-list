import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ListItemService from './listItem.service'
import ListItemRepository from '../infra/listItem.repository'

describe('ListItemService', () => {
  let service: ListItemService
  let repository: ListItemRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ListItemService)
    repository = container.resolve(ListItemRepository)
  })

  describe('should have a "finish" method that', () => {
    it('resolves when item is marked as finished', async () => {
      // Data
      const id = uuid()

      // Dependencies
      const finish = stub(repository, 'finish').resolves()

      // Execute
      const promise = service.finish(id)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(finish, id)
    })
  })
})
