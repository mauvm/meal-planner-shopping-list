import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  OnUndefined,
  Params,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import HttpStatus from 'http-status-codes'
import { AssertionError } from 'assert'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemCreated from '../../user.shoppingListItem.create/domain/shoppingListItemCreated.event'

class FinishRequestParamsDTO {
  @IsUUID()
  id: string
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class FinishShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Post('/:id/finish')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async finish(@Params() { id }: FinishRequestParamsDTO): Promise<void> {
    try {
      await this.service.finish(id)
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
