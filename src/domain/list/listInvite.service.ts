import assert from 'assert'
import crypto from 'crypto'
import { singleton } from 'tsyringe'
import ListEntity from './list.entity'
import ConfigService from '../config.service'

@singleton()
export default class ListInviteService {
  constructor(private config: ConfigService) {}

  createInviteCode(
    list: ListEntity,
    timeToLiveMs = 3 * 24 * 60 * 60 * 1000,
  ): string {
    assert.ok(timeToLiveMs > 0, 'Time to live (ms) must be a positive number')

    const data = {
      listId: list.id,
      expiresAt: new Date(Date.now() + timeToLiveMs).toISOString(),
    }

    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.getSecretKey(),
      this.getInitializationVector(),
    )
    const crypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    return crypted + cipher.final('hex')
  }

  getListIdFromInviteCode(code: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.getSecretKey(),
      this.getInitializationVector(),
    )
    const decrypted = decipher.update(code, 'hex', 'utf8')

    // Using decipher final results in error:
    // "Unsupported state or unable to authenticate data"
    // @see https://github.com/nodejs/help/issues/1034
    const data = JSON.parse(decrypted) // + decipher.final('utf8'))

    assert.ok(typeof data.listId === 'string', 'No list ID in list invite code')
    assert.ok(data.listId.length > 0, 'Empty list ID in list invite code')

    assert.ok(
      typeof data.expiresAt === 'string',
      'No expire date in list invite code',
    )
    assert.ok(
      !isNaN(new Date(data.expiresAt).getTime()),
      'Invalid expire date in list invite code',
    )
    assert.ok(new Date(data.expiresAt) >= new Date(), 'Invite code has expired')

    return data.listId
  }

  private getSecretKey(): Buffer {
    const secretKey = this.config.get<string>('list.inviteCode.secretKey', '')

    if (!secretKey) {
      throw new Error('No secret key configured for creating list invite codes')
    }

    return crypto.scryptSync(secretKey, 'my-hardcoded-salt', 32)
  }

  /**
   * @see https://en.wikipedia.org/wiki/Initialization_vector
   */
  private getInitializationVector(): Buffer {
    return Buffer.alloc(32, 0) // No IV
  }
}
