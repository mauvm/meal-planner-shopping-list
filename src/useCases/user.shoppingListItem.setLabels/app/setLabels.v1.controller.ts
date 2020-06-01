import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  OnUndefined,
  Params,
  Body,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID, IsArray, IsString, IsNotEmpty } from 'class-validator'
import HttpStatus from 'http-status-codes'
import { AssertionError } from 'assert'
import ShoppingListItemService from '../domain/shoppingListItem.service'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'

class SetItemLabelsRequestParamsDTO {
  @IsUUID()
  id: string
}

class SetItemLabelsRequestBodyDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  labels: string[] = []
}

@singleton()
@JsonController('/v1/shopping-lists/items')
export default class SetShoppingListItemLabelsV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Post('/:id/set-labels')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async fetch(
    @Params() { id }: SetItemLabelsRequestParamsDTO,
    @Body() { labels }: SetItemLabelsRequestBodyDTO,
  ): Promise<void> {
    try {
      await this.service.setLabels(id, labels)
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
