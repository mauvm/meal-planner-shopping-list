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
import ListItemService from '../domain/listItem.service'
import { Response } from 'koa'

class CreateRequestParamsDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  title: string
}

@singleton()
@JsonController('/v1/lists/items')
export default class CreateListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Post('/')
  @Redirect('/v1/lists/items/:id')
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
