import { singleton } from 'tsyringe'
import { JsonController, Get, Params } from 'routing-controllers'
import { IsUUID } from 'class-validator'
import { plainToClass } from 'class-transformer'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

class FetchRequestParamsDTO {
  @IsUUID()
  uuid: string
}

class FetchResponseDTO {
  data: ShoppingListItemEntity
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class FetchShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/:uuid')
  async fetch(
    @Params() { uuid }: FetchRequestParamsDTO,
  ): Promise<FetchResponseDTO> {
    const item = await this.service.findOneByIdOrFail(uuid)

    return plainToClass(FetchResponseDTO, { data: item })
  }
}
