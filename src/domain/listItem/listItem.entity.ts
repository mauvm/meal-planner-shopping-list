import { injectable } from 'tsyringe'
import {
  IsUUID,
  IsString,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
} from 'class-validator'

@injectable()
export default class ListItemEntity {
  @IsUUID()
  id: string

  @IsNotEmpty()
  @IsString()
  title: string

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  labels: string[] = []

  @IsNotEmpty()
  @IsDate()
  createdAt: Date

  @IsOptional()
  @IsDate()
  finishedAt?: Date
}
