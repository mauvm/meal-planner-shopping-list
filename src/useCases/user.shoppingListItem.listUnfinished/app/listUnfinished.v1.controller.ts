import { singleton } from 'tsyringe'
import { JsonController, Get } from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

class ListUnfinishedResponseDTO {
  data: ShoppingListItemEntity[]
}

@singleton()
@JsonController('/v1/shopping-lists/unfinished-items')
export default class ListUnfinishedShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/')
  async listUnfinished(): Promise<ListUnfinishedResponseDTO> {
    const items = await this.service.findAllUnfinished()

    return plainToClass(ListUnfinishedResponseDTO, { data: items })
  }
}
