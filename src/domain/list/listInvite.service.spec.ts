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
  })

  describe('should have a "getListIdFromInviteCode" method that', () => {
    it('throws error when no secret key is configured', () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', '')

      // Execute
      const result = () => service.getListIdFromInviteCode('abcd')

      // Test
      expect(result).to.throw(
        'No secret key configured for creating list invite codes',
      )
    })

    it('throws error when unable to decrypt code', () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')

      // Execute
      const result = () => service.getListIdFromInviteCode('test')

      // Test
      expect(result).to.throw('Unable to parse JSON from invite code')
    })

    it('throws error when decrypted code has no list ID', () => {
      // Data
      const list = plainToClass(ListEntity, { id: undefined })

      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')
      const code = service.createInviteCode(list)

      // Execute
      const result = () => service.getListIdFromInviteCode(code)

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
      const result = () => service.getListIdFromInviteCode(code)

      // Test
      expect(result).to.throw('Empty list ID in list invite code')
    })

    it('throws error when decrypted code has expired', async () => {
      // Data
      const list = plainToClass(ListEntity, { id: '1234' })

      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')
      const code = service.createInviteCode(list, 1)
      await new Promise((resolve) => setTimeout(resolve, 10)) // Ensure invite code expired

      // Execute
      const result = () => service.getListIdFromInviteCode(code)

      // Test
      expect(result).to.throw('Invite code has expired')
    })

    it('returns decrypted list ID', () => {
      // Data
      const list = plainToClass(ListEntity, { id: uuid() })

      // Dependencies
      config.set('list.inviteCode.secretKey', 'test')
      const code = service.createInviteCode(list, 1000)

      // Execute
      const result = service.getListIdFromInviteCode(code)

      // Test
      expect(result).to.equal(list.id)
    })
  })
})
