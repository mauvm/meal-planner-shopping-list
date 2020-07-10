import { container } from 'tsyringe'
import { expect } from 'chai'
import { UnauthorizedError } from 'routing-controllers'
import UserService from './user.service'

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    service = container.resolve(UserService)
  })

  describe('should have a "checkAuthorization" method that', () => {
    it('resolves to true', async () => {
      // Execute
      const result = await service.checkAuthorization()

      // Test
      expect(result).to.be.true
    })
  })

  describe('should have a "getCurrentUser" method that', () => {
    it('rejects on missing authorization header', async () => {
      // Data
      const action = { request: { headers: {} } } as any

      // Execute
      const promise = service.getCurrentUser(action)

      // Test
      await expect(promise).to.be.rejectedWith(
        UnauthorizedError,
        'Missing Bearer JWT in Authorization header',
      )
    })

    it('rejects on non-bearer authorization header', async () => {
      // Data
      const action = {
        request: { headers: { authorization: 'not-bearer abcd' } },
      } as any

      // Execute
      const promise = service.getCurrentUser(action)

      // Test
      await expect(promise).to.be.rejectedWith(
        UnauthorizedError,
        'Missing Bearer JWT in Authorization header',
      )
    })

    it('rejects on non-bearer authorization header', async () => {
      // Data
      const action = {
        request: {
          headers: { authorization: 'Bearer invalid.invalid.invalid' },
        },
      } as any

      // Execute
      const promise = service.getCurrentUser(action)

      // Test
      await expect(promise).to.be.rejectedWith(
        UnauthorizedError,
        'Invalid JWT in Authorization header',
      )
    })

    it('resolves to UserEntity with sub as user ID', async () => {
      // Data
      const action = {
        request: {
          headers: {
            authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          },
        },
      } as any

      // Execute
      const promise = service.getCurrentUser(action)

      // Test
      await expect(promise).to.be.eventually.deep.equal({ id: '1234567890' })
    })
  })
})
