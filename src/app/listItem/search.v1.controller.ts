import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  QueryParam,
  BadRequestError,
  Params,
  NotFoundError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import ListCreated from '../../domain/list/listCreated.event'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemEntity from '../../domain/listItem/listItem.entity'

class SearchListItemRequestParamsDTO {
  @IsUUID()
  listId: string
}

class SearchItemsResponseDTO {
  data: ListItemEntity[]
}

@singleton()
@JsonController('/v1/lists')
export default class SearchListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Get('/:listId/search-items')
  searchItems(
    @Params() { listId }: SearchListItemRequestParamsDTO,
    @QueryParam('query') query: string,
  ): SearchItemsResponseDTO {
    if (!query) {
      throw new BadRequestError('Missing query parameter "query"')
    }

    try {
      const items = this.service.searchItems(listId, query)

      return { data: items }
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

      throw err
    }
  }
}
