import { singleton } from 'tsyringe'
import { JsonController, Get } from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import ListService from '../../domain/list/list.service'
import ListEntity from '../../domain/list/list.entity'

class FetchResponseDTO {
  data: ListEntity[]
}

@singleton()
@JsonController('/v1/lists')
export default class FetchAllListV1Controller {
  constructor(private service: ListService) {}

  @Get('/')
  async fetchAll(): Promise<FetchResponseDTO> {
    const lists = await this.service.findAll()

    return plainToClass(FetchResponseDTO, { data: lists })
  }
}
