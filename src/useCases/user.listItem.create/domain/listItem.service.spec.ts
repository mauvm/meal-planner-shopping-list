import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import ListItemService from './listItem.service'
import ListItemRepository from '../infra/listItem.repository'
import { plainToClass } from 'class-transformer'
import ListItemEntity from '../../../shared/domain/listItem.entity'

describe('ListItemService', () => {
  let service: ListItemService
  let repository: ListItemRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ListItemService)
    repository = container.resolve(ListItemRepository)
  })

  describe('should have a "create" method that', () => {
    it('resolves to an ID for the created list item', async () => {
      // Data
      const id = uuid()
      const title = 'Test'
      let item = plainToClass(ListItemEntity, { id, title })

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
