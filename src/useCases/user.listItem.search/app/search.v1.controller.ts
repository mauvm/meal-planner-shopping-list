import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  QueryParam,
  BadRequestError,
} from 'routing-controllers'
import ListItemService from '../domain/listItem.service'
import ListItemEntity from '../../../shared/domain/listItem.entity'

class SearchItemsResponseDTO {
  data: ListItemEntity[]
}

@singleton()
@JsonController('/v1/lists/search-items')
export default class SearchListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Get('/')
  searchItems(@QueryParam('query') query: string): SearchItemsResponseDTO {
    if (!query) {
      throw new BadRequestError('Missing query parameter "query"')
    }

    return { data: this.service.searchItems(query) }
  }
}
