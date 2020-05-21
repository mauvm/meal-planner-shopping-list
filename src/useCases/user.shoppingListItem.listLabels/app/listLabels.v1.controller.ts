import { singleton } from 'tsyringe'
import { JsonController, Get } from 'routing-controllers'
import ShoppingListItemService from '../domain/shoppingListItem.service'

class ListLabelsResponseDTO {
  data: string[]
}

@singleton()
@JsonController('/v1/shopping-lists/list-items-labels')
export default class ListShoppingListItemLabelsV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/')
  listLabels(): ListLabelsResponseDTO {
    return { data: this.service.listLabels() }
  }
}
