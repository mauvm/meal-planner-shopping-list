import { container } from 'tsyringe'
import { expect } from 'chai'
import ConfigService from './config.service'

describe('ConfigService', () => {
  let service: ConfigService

  beforeEach(() => {
    service = container.resolve(ConfigService)
  })

  describe('should have a "set" method that', () => {
    it('sets the internal configuration path to given value', () => {
      // Execute
      service.set('test.foo', 'bar')
      service.set('test.baz', 'qux')

      // Test
      expect(service.get('test.foo')).to.equal('bar')
      expect(service.get('test.baz')).to.equal('qux')
    })
  })

  describe('should have a "get" method that', () => {
    it('gets the internal configuration value for given path', () => {
      // Dependencies
      service.set('test.foo', 'bar')
      service.set('test.baz', 'qux')

      // Execute
      const result1 = service.get('test.foo')
      const result2 = service.get('test.baz')

      // Test
      expect(result1).to.equal('bar')
      expect(result2).to.equal('qux')
    })

    it('gets environment value for given path', () => {
      // Dependencies
      process.env.TEST_FOO = 'bar'
      process.env.TEST_BAZ_QUUX = 'qux'

      // Execute
      const result1 = service.get('test.foo', 'test1')
      const result2 = service.get('test.bazQuux', 'test2')

      // Test
      expect(result1).to.equal('bar')
      expect(result2).to.equal('qux')
    })

    it('defaults to given value on no configuration for given path', () => {
      // Execute
      const result1 = service.get('test.fooBar', 'test1')
      const result2 = service.get('test.bazQux', 'test2')

      // Test
      expect(result1).to.equal('test1')
      expect(result2).to.equal('test2')
    })
  })
})
