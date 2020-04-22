import { injectable } from 'tsyringe'
import { IsUUID, IsString, IsNotEmpty } from 'class-validator'

@injectable()
export default class ShoppingListItemEntity {
  @IsUUID()
  uuid: string

  @IsNotEmpty()
  @IsString()
  title: string
}
