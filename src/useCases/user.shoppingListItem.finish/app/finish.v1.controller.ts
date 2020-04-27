import { singleton } from 'tsyringe'
import { JsonController, Post, OnUndefined, Params } from 'routing-controllers'
import { IsUUID } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ShoppingListItemService from '../domain/shoppingListItem.service'

class FinishRequestParamsDTO {
  @IsUUID()
  uuid: string
}
@singleton()
@JsonController('/v1/shopping-lists/items')
export default class CreateShoppingListItemV1Controller {
  constructor(private service: ShoppingListItemService) {}

  @Post('/:uuid/finish')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async fetch(@Params() { uuid }: FinishRequestParamsDTO): Promise<void> {
    await this.service.finish(uuid)
  }
}
