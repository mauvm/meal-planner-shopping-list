import { singleton } from 'tsyringe'
import { JsonController, Post, Body, Res } from 'routing-controllers'
import { IsNotEmpty, IsString, IsArray, MaxLength } from 'class-validator'
import { Response } from 'koa'
import HttpStatus from 'http-status-codes'
import ListService from '../../domain/list/list.service'

class CreateRequestParamsDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  title: string

  @IsArray()
  @IsString({ each: true })
  labels: string[] = []
}

@singleton()
@JsonController('/v1/lists')
export default class CreateListV1Controller {
  constructor(private service: ListService) {}

  @Post('/')
  async create(
    @Body() data: CreateRequestParamsDTO,
    @Res() res: Response,
  ): Promise<Response> {
    const id = await this.service.create({ title: data.title })

    res.set('Access-Control-Expose-Headers', 'X-Resource-Id')
    res.set('X-Resource-Id', id)
    res.status = HttpStatus.CREATED
    res.body = { id }

    return res
  }
}
