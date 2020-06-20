import { singleton } from 'tsyringe'
import { JsonController, Get } from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import ListItemService from '../domain/listItem.service'
import ListItemEntity from '../domain/listItem.entity'

class ListUnfinishedResponseDTO {
  data: ListItemEntity[]
}

@singleton()
@JsonController('/v1/lists/unfinished-items')
export default class ListUnfinishedListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Get('/')
  async listUnfinished(): Promise<ListUnfinishedResponseDTO> {
    const items = await this.service.findAllUnfinished()

    return plainToClass(ListUnfinishedResponseDTO, { data: items })
  }
}
