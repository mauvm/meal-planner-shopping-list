import { singleton } from 'tsyringe'
import { JsonController, Get, Params } from 'routing-controllers'
import { IsUUID } from 'class-validator'
import ListItemService from '../../domain/listItem/listItem.service'

class FetchItemsLabelsRequestParamsDTO {
  @IsUUID()
  listId: string
}

class FetchItemsLabelsResponseDTO {
  data: string[]
}

@singleton()
@JsonController('/v1/lists')
export default class ListItemLabelsV1Controller {
  constructor(private service: ListItemService) {}

  @Get('/:listId/items-labels')
  fetchItemsLabels(
    @Params() { listId }: FetchItemsLabelsRequestParamsDTO,
  ): FetchItemsLabelsResponseDTO {
    // @todo Throw 404 Not Found if list does not exist

    const labels = this.service.fetchAllListLabels(listId)

    return { data: labels }
  }
}
