import { container } from 'tsyringe'
import { expect } from 'chai'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListInviteService from './listInvite.service'
import ListEntity from './list.entity'
import ConfigService from '../config.service'

describe('ListInviteService', () => {
  let config: ConfigService
  let service: ListInviteService

  beforeEach(() => {
    container.clearInstances()

    config = container.resolve(ConfigService)

    service = container.resolve(ListInviteService)
  })

  describe('should have a "createInviteCode" method that', () => {
    const list = plainToClass(ListEntity, { id: uuid() })

    it('throws error on non-positive time to live', () => {
      // Execute
      const result = () => service.createInviteCode(list, -1)

      // Test
      expect(result).to.throw('Time to live (ms) must be a positive number')
    })

    it('throws error when no secret key is configured', () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', '')

      // Execute
      const result = () => service.createInviteCode(list)

      // Test
      expect(result).to.throw(
        'No secret key configured for creating list invite codes',
      )
    })

    it('returns encrypted invite code for given list', () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')

      // Execute
      const result = service.createInviteCode(list)

      // Test
      expect(result).to.be.a('string').that.is.not.empty
    })

    it('returns invite code that expires in three days by default', () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')

      // Execute
      const result = service.createInviteCode(list)

      // Test
      expect(result).to.be.a('string').that.is.not.empty
      const decrypted = service.resolveInviteCode(result)
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000
      expect(Number(new Date(decrypted.expiresAt))).to.be.closeTo(
        Date.now() + threeDaysMs,
        1000,
      )
    })
  })

  describe('should have a "resolveInviteCode" method that', () => {
    it('throws error when no secret key is configured', () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', '')

      // Execute
      const result = () => service.resolveInviteCode('abcd')

      // Test
      expect(result).to.throw(
        'No secret key configured for creating list invite codes',
      )
    })

    it('throws error when decrypted code has no list ID', () => {
      // Data
      const list = plainToClass(ListEntity, { id: undefined })

      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')
      const code = service.createInviteCode(list)

      // Execute
      const result = () => service.resolveInviteCode(code)

      // Test
      expect(result).to.throw('No list ID in list invite code')
    })

    it('throws error when decrypted code has no list ID', () => {
      // Data
      const list = plainToClass(ListEntity, { id: '' })

      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')
      const code = service.createInviteCode(list)

      // Execute
      const result = () => service.resolveInviteCode(code)

      // Test
      expect(result).to.throw('Empty list ID in list invite code')
    })

    it('returns decrypted list invite data', () => {
      // Data
      const list = plainToClass(ListEntity, { id: uuid() })

      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')
      const code = service.createInviteCode(list, 1)

      // Execute
      const result = service.resolveInviteCode(code)

      // Test
      expect(result.listId).to.equal(list.id)
      expect(result.expiresAt).to.be.a('string').that.is.not.empty
      expect(Number(new Date(result.expiresAt))).to.be.closeTo(Date.now(), 1000)
    })
  })
})
