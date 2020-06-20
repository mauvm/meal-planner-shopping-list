import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
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
