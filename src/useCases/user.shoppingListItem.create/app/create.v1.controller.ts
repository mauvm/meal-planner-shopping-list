import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  Body,
  Redirect,
  HttpCode,
  Res,
} from 'routing-controllers'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import { Response } from 'koa'

class CreateRequestParamsDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  title: string
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class CreateShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Post('/')
  @Redirect('/v1/shopping-lists/items/:id')
  @HttpCode(HttpStatus.SEE_OTHER)
  async create(
    @Body() data: CreateRequestParamsDTO,
    @Res() res: Response,
  ): Promise<{ id: string }> {
    const id = await this.service.create(data)

    res.set('X-Resource-Id', id)

    return { id }
  }
}
