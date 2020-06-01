import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  Params,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { AssertionError } from 'assert'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemCreated from '../../user.shoppingListItem.create/domain/shoppingListItemCreated.event'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

class FetchRequestParamsDTO {
  @IsUUID()
  id: string
}

class FetchResponseDTO {
  data: ShoppingListItemEntity
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class FetchShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Get('/:id')
  async fetch(
    @Params() { id }: FetchRequestParamsDTO,
  ): Promise<FetchResponseDTO> {
    try {
      const item = await this.service.findOneByIdOrFail(id)

      return plainToClass(FetchResponseDTO, { data: item })
    } catch (err) {
      if (
        err instanceof AssertionError &&
        err.expected === ShoppingListItemCreated.name
      ) {
        throw new BadRequestError(`No shopping list item found for ID "${id}"`)
      }

      throw err
    }
  }
}
