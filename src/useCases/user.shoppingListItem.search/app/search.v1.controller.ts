import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  QueryParam,
  BadRequestError,
} from 'routing-controllers'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

class SearchItemsResponseDTO {
  data: ShoppingListItemEntity[]
}

@singleton()
@JsonController('/v1/shopping-lists/search-items')
export default class SearchShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/')
  searchItems(@QueryParam('query') query: string): SearchItemsResponseDTO {
    if (!query) {
      throw new BadRequestError('Missing query parameter "query"')
    }

    return { data: this.service.searchItems(query) }
  }
}
