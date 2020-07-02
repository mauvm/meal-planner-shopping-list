import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  OnUndefined,
  Params,
  NotFoundError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemCreated from '../../domain/listItem/listItemCreated.event'

class FinishRequestParamsDTO {
  @IsUUID()
  listId: string

  @IsUUID()
  itemId: string
}

@singleton()
@JsonController('/v1/lists')
export default class FinishListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Post('/:listId/items/:itemId/finish')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async finish(
    @Params() { listId, itemId }: FinishRequestParamsDTO,
  ): Promise<void> {
    try {
      const item = await this.service.findOneByIdOrFail(itemId)

      if (item.listId !== listId) {
        throw new NotFoundError(`No list item found for ID "${itemId}"`)
      }

      await this.service.finish(item.id)
    } catch (err) {
      if (
        err instanceof AssertionError &&
        err.expected === ListItemCreated.name
      ) {
        throw new NotFoundError(`No list item found for ID "${itemId}"`)
      }

      throw err
    }
  }
}
