import { singleton } from 'tsyringe'
import { JsonController, Get, Params } from 'routing-controllers'
import { IsUUID, IsString } from 'class-validator'
import { plainToClass, classToPlain } from 'class-transformer'
import ShoppingListItemService from '../domain/shoppingListItem.service'

class FetchParamsDTO {
  @IsUUID()
  uuid: string
}

class FetchResponseDTO {
  @IsUUID()
  uuid: string

  @IsString()
  title: string
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class ShoppingListItemFetchV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/:uuid')
  async fetch(@Params() { uuid }: FetchParamsDTO): Promise<FetchResponseDTO> {
    const item = await this.service.findOneByIdOrFail(uuid)

    return plainToClass(FetchResponseDTO, classToPlain(item))
  }
}
