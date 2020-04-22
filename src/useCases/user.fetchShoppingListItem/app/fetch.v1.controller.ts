import { singleton } from 'tsyringe'
import { JsonController, Get, Params } from 'routing-controllers'
import { IsUUID, IsString } from 'class-validator'
import { plainToClass, classToPlain } from 'class-transformer'
import ShoppingListItemService from '../domain/shoppingListItem.service'

class FetchRequestParamsDTO {
  @IsUUID()
  id: string
}

class FetchResponseDTO {
  @IsUUID()
  id: string

  @IsString()
  title: string
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class ShoppingListItemFetchV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/:id')
  async fetch(
    @Params() { id }: FetchRequestParamsDTO,
  ): Promise<FetchResponseDTO> {
    const item = await this.service.findOneByIdOrFail(id)

    return plainToClass(FetchResponseDTO, classToPlain(item))
  }
}
