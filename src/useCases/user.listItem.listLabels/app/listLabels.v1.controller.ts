import { singleton } from 'tsyringe'
import { JsonController, Get } from 'routing-controllers'
import ListItemService from '../domain/listItem.service'

class ListLabelsResponseDTO {
  data: string[]
}

@singleton()
@JsonController('/v1/lists/list-items-labels')
export default class ListListItemLabelsV1Controller {
  constructor(private service: ListItemService) {}

  @Get('/')
  listLabels(): ListLabelsResponseDTO {
    return { data: this.service.listLabels() }
  }
}
