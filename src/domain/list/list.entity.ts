import { injectable } from 'tsyringe'
import { IsUUID, IsString, IsDate, IsNotEmpty } from 'class-validator'

@injectable()
export default class ListEntity {
  @IsUUID()
  id: string

  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsDate()
  createdAt: Date
}
