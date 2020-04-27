import { injectable } from 'tsyringe'
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator'

@injectable()
export default class ShoppingListItemEntity {
  @IsUUID()
  uuid: string

  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsDate()
  createdAt: Date

  @IsOptional()
  @IsDate()
  finishedAt?: Date
}
