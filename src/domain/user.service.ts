import { singleton } from 'tsyringe'
import { Action, UnauthorizedError } from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import jwt from 'jsonwebtoken'
import UserEntity from './user.entity'

@singleton()
export default class UserService {
  async checkAuthorization(): Promise<boolean> {
    return true
  }

  async getCurrentUser(action: Action): Promise<UserEntity> {
    const authorization = action.request.headers['authorization'] || ''

    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedError('Missing Bearer JWT in Authorization header')
    }

    const data = jwt.decode(authorization.substr('bearer '.length))

    if (!data) {
      throw new UnauthorizedError('Invalid JWT in Authorization header')
    }

    const userId = data.sub

    return plainToClass(UserEntity, { id: userId })
  }
}
