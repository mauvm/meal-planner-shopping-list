import { singleton } from 'tsyringe'
import {
  JsonController,
  Patch,
  OnUndefined,
  Params,
  Body,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID, IsString } from 'class-validator'
import HttpStatus from 'http-status-codes'
import { AssertionError } from 'assert'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemCreated from '../../user.shoppingListItem.create/domain/shoppingListItemCreated.event'

class SetItemTitleRequestParamsDTO {
  @IsUUID()
  id: string
}

class SetItemTitleRequestBodyDTO {
  @IsString()
  title: string
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class SetShoppingListItemTitleV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Patch('/:id')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async update(
    @Params() { id }: SetItemTitleRequestParamsDTO,
    @Body() { title }: SetItemTitleRequestBodyDTO,
  ): Promise<void> {
    try {
      await this.service.setTitle(id, title)
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
