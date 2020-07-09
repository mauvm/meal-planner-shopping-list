import { Matches } from 'class-validator'

export type UserId = string

export default class UserEntity {
  // @see https://auth0.com/docs/users/normalized/auth0/identify-users
  @Matches(/^\w+\|[a-f0-9]+$/)
  id: UserId
}
