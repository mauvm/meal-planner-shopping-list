import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  Body,
  Redirect,
  HttpCode,
} from 'routing-controllers'
import { IsNotEmpty, IsString } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ShoppingListItemService from '../domain/shoppingListItem.service'

class CreateRequestParamsDTO {
  @IsNotEmpty()
  @IsString()
  title: string
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class CreateShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Post('/')
  @Redirect('/v1/shopping-lists/items/:uuid')
  @HttpCode(HttpStatus.SEE_OTHER)
  async fetch(@Body() data: CreateRequestParamsDTO): Promise<{ uuid: string }> {
    const uuid = await this.service.create(data)

    return { uuid }
  }
}
