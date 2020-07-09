import { container } from 'tsyringe'
import { stub, assert, match } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListService from './list.service'
import ListEntity from './list.entity'
import ListRepository from '../../infra/list/list.repository'
import UserEntity from '../user.entity'

describe('ListService', () => {
  let service: ListService
  let repository: ListRepository

  beforeEach(() => {
    container.clearInstances()

    service = container.resolve(ListService)
    repository = container.resolve(ListRepository)
  })

  describe('should have a "create" method that', () => {
    const user = plainToClass(UserEntity, { id: 'test|1234' })

    it('resolves to an ID for the created list', async () => {
      // Data
      const id = uuid()
      const title = 'Test'

      // Dependencies
      const create = stub(repository, 'create').resolves(id)

      // Execute
      const promise = service.create({ title }, user)

      // Test
      await expect(promise).to.eventually.equal(id)
      assert.calledOnce(create)
    })

    it('trims the title', async () => {
      // Data
      const id = uuid()
      const title = ' Test '

      // Dependencies
      const create = stub(repository, 'create').resolves(id)

      // Execute
      const promise = service.create({ title }, user)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(create, match({ title: 'Test' }), user)
    })

    it('sets the user as owner', async () => {
      // Data
      const id = uuid()
      const title = 'Test'

      // Dependencies
      const create = stub(repository, 'create').resolves(id)

      // Execute
      const promise = service.create({ title }, user)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(create, match({ owners: [user.id] }), user)
    })
  })

  describe('should have a "findOneByIdOrFail" method that', () => {
    it('resolves to ListEntity for given ID', async () => {
      // Data
      const id = uuid()
      const item = plainToClass(ListEntity, {
        createdAt: new Date(),
      })

      // Dependencies
      const findOneOrFail = stub(repository, 'findOneOrFail').resolves(item)

      // Execute
      const promise = service.findOneByIdOrFail(id)

      // Test
      await expect(promise).to.eventually.deep.equal(item)
      assert.calledOnce(findOneOrFail)
    })
  })

  describe('should have a "findAllForUser" method that', () => {
    const user = plainToClass(UserEntity, { id: 'test|1234' })

    it('resolves to ListEntity[] that is sorted by oldest first', async () => {
      // Data
      const item1 = plainToClass(ListEntity, {
        createdAt: new Date(Date.now() - 1000).toISOString(),
      })
      const item2 = plainToClass(ListEntity, {
        createdAt: new Date(Date.now() - 2000).toISOString(),
      })

      // Dependencies
      const findAll = stub(repository, 'findAllForUser').resolves([
        item1,
        item2,
      ])

      // Execute
      const promise = service.findAllForUser(user)

      // Test
      await expect(promise).to.eventually.deep.equal([item2, item1])
      assert.calledOnce(findAll)
    })
  })
})
