import { container } from 'tsyringe'
import { stub, assert, SinonStub } from 'sinon'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListItemService from './listItem.service'
import ListItemRepository from '../infra/listItem.repository'
import ListItemEntity from '../domain/listItem.entity'

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

  describe('should have a "searchItems" method that', () => {
    let searchItems: SinonStub

    const query = 'Foo'
    let item1: ListItemEntity
    let item2: ListItemEntity

    beforeEach(() => {
      // Data
      item1 = plainToClass(ListItemEntity, {
        id: uuid(),
        title: 'Foo',
        createdAt: new Date(Date.now() - 1000),
      })
      item2 = plainToClass(ListItemEntity, {
        id: uuid(),
        title: 'foo foo',
        createdAt: new Date(Date.now() - 2000),
      })

      // Dependencies
      searchItems = stub(repository, 'searchItems').returns([item1, item2])
    })

    it('returns list of items that match query', async () => {
      // Execute
      const result = service.searchItems(query)

      // Test
      expect(result).to.deep.equal([item1, item2])
      assert.calledOnceWithExactly(searchItems, query)
    })

    it('returns list of found items without same titled items that have no labels', async () => {
      // Data
      item2.title = item1.title.toLowerCase()
      item2.labels = ['bar']

      // Execute
      const result = service.searchItems(query)

      // Test
      expect(result).to.deep.equal([item2])
      assert.calledOnceWithExactly(searchItems, query)
    })

    it('returns list of found items that have newest items first', async () => {
      // Data
      item1.createdAt = new Date(Date.now() - 2000)
      item2.createdAt = new Date(Date.now() - 1000)

      // Execute
      const result = service.searchItems(query)

      // Test
      expect(result).to.deep.equal([item2, item1])
      assert.calledOnceWithExactly(searchItems, query)
    })

    it('returns list of maximum of 20 items', async () => {
      // Data
      const items = Array(21)
        .fill(null)
        .map((_, index) =>
          plainToClass(ListItemEntity, {
            id: uuid(),
            title: `Item ${index}`,
            labels: [],
            createdAt: new Date(Date.now() + index * 1000),
          }),
        )

      // Dependencies
      searchItems.returns(items)

      // Execute
      const result = service.searchItems(query)

      // Test
      expect(result).to.be.an('array').with.lengthOf(20)
      expect(result[0]).to.deep.equal(items[20])
      expect(result[19]).to.deep.equal(items[1])
      assert.calledOnceWithExactly(searchItems, query)
    })
  })

  describe('should have a "setTitle" method that', () => {
    it('resolves when item labels have been updated', async () => {
      // Data
      const id = uuid()
      const title = 'Other title'

      // Dependencies
      const setTitle = stub(repository, 'setTitle').resolves()

      // Execute
      const promise = service.setTitle(id, title)

      // Test
      await expect(promise).to.be.fulfilled
      assert.calledOnceWithExactly(setTitle, id, title)
    })
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
