import { injectable } from 'tsyringe'
import { IsUUID, IsString, IsDate, IsNotEmpty, IsArray } from 'class-validator'
import { Exclude } from 'class-transformer'
import UserEntity, { UserId } from '../user.entity'
import ListItemEntity from '../listItem/listItem.entity'

@injectable()
export default class ListEntity {
  @IsUUID()
  id: string

  @IsNotEmpty()
  @IsString()
  title: string

  @Exclude({ toPlainOnly: true })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  owners: UserId[] = []

  @IsString()
  inviteCode?: string

  @IsNotEmpty()
  @IsDate()
  createdAt: Date

  hasOwner(user: UserEntity): boolean {
    return this.owners?.length > 0 && this.owners.includes(user.id)
  }

  addOwner(user: UserEntity): void {
    this.owners = this.owners || []

    if (!this.hasOwner(user)) {
      this.owners.push(user.id)
    }
  }

  hasItem(item: ListItemEntity): boolean {
    return this.id === item.listId
  }
}
