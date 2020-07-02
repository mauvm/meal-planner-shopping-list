import { container } from 'tsyringe'
import { stub, assert } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListService from './list.service'
import ListEntity from './list.entity'
import ListRepository from '../../infra/list/list.repository'

describe('ListService', () => {
  let service: ListService
  let repository: ListRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ListService)
    repository = container.resolve(ListRepository)
  })

  describe('should have a "create" method that', () => {
    it('resolves to an ID for the created list', async () => {
      // Data
      const id = uuid()
      const title = 'Test'
      let item = plainToClass(ListEntity, { id, title })

      // Dependencies
      const create = stub(repository, 'create').resolves(id)

      // Execute
      const promise = service.create({ title })

      // Test
      await expect(promise).to.eventually.equal(id)
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

  describe('should have a "findOneByIdOrFail" method that', () => {
    const id = uuid()

    it('resolves to a ListEntity when found for given ID', async () => {
      // Data
      const item = container.resolve(ListEntity)

      // Dependencies
      const findOneOrFail = stub(repository, 'findOneOrFail').resolves(item)

      // Execute
      const promise = service.findOneByIdOrFail(id)

      // Test
      await expect(promise).to.eventually.equal(item)
      assert.calledOnceWithExactly(findOneOrFail, id)
    })
  })

  describe('should have a "findAll" method that', () => {
    it('resolves to ListEntity[]', async () => {
      // Data
      const item1 = plainToClass(ListEntity, {})
      const item2 = plainToClass(ListEntity, {})

      // Dependencies
      const findAll = stub(repository, 'findAll').resolves([item1, item2])

      // Execute
      const promise = service.findAll()

      // Test
      await expect(promise).to.eventually.deep.equal([item1, item2])
      assert.calledOnce(findAll)
    })
  })
})
