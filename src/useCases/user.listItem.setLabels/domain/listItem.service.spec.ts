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
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(setLabels, id, labels)
    })

    it('trims the labels', async () => {
      // Data
      const id = uuid()
      const labels = [' Foo ', 'Bar\t  ']

      // Dependencies
      const setLabels = stub(repository, 'setLabels').resolves()

      // Execute
      const promise = service.setLabels(id, labels)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(setLabels, id, ['Foo', 'Bar'])
    })

    it('ignores empty labels', async () => {
      // Data
      const id = uuid()
      const labels = ['Foo', '', 'Bar\t  ', '   ']

      // Dependencies
      const setLabels = stub(repository, 'setLabels').resolves()

      // Execute
      const promise = service.setLabels(id, labels)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(setLabels, id, ['Foo', 'Bar'])
    })
  })
})
