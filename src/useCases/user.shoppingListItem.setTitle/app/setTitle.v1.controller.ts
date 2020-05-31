import { singleton } from 'tsyringe'
import {
  JsonController,
  Patch,
  OnUndefined,
  Params,
  Body,
} from 'routing-controllers'
import { IsUUID, IsString } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ShoppingListItemService from '../domain/shoppingListItem.service'

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
    await this.service.setTitle(id, title)
  }
}
