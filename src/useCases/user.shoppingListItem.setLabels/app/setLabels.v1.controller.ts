import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  OnUndefined,
  Params,
  Body,
} from 'routing-controllers'
import { IsUUID, IsArray } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ShoppingListItemService from '../domain/shoppingListItem.service'

class SetItemLabelsRequestParamsDTO {
  @IsUUID()
  id: string
}

class SetItemsLabelsRequestBodyDTO {
  @IsArray()
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
    @Body() { labels }: SetItemsLabelsRequestBodyDTO,
  ): Promise<void> {
    await this.service.setLabels(id, labels)
  }
}
