import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Patch,
  OnUndefined,
  Params,
  Body,
  NotFoundError,
} from 'routing-controllers'
import { IsUUID, IsString } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemCreated from '../../domain/listItem/listItemCreated.event'

class SetItemTitleRequestParamsDTO {
  @IsUUID()
  listId: string

  @IsUUID()
  itemId: string
}

class SetItemTitleRequestBodyDTO {
  @IsString()
  title: string
}

@singleton()
@JsonController('/v1/lists')
export default class SetListItemTitleV1Controller {
  constructor(private service: ListItemService) {}

  @Patch('/:listId/items/:itemId')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async update(
    @Params() { listId, itemId }: SetItemTitleRequestParamsDTO,
    @Body() { title }: SetItemTitleRequestBodyDTO,
  ): Promise<void> {
    try {
      const item = await this.service.findOneByIdOrFail(itemId)

      if (item.listId !== listId) {
        throw new NotFoundError(`No list item found for ID "${itemId}"`)
      }

      await this.service.setTitle(item.id, title)
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
