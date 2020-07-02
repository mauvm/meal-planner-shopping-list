import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Put,
  OnUndefined,
  Params,
  Body,
  NotFoundError,
} from 'routing-controllers'
import { IsUUID, IsArray, IsString, IsNotEmpty } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemCreated from '../../domain/listItem/listItemCreated.event'

class SetItemLabelsRequestParamsDTO {
  @IsUUID()
  listId: string

  @IsUUID()
  itemId: string
}

class SetItemLabelsRequestBodyDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  labels: string[] = []
}

@singleton()
@JsonController('/v1/lists')
export default class SetListItemLabelsV1Controller {
  constructor(private service: ListItemService) {}

  @Put('/:listId/items/:itemId/labels')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async fetch(
    @Params() { listId, itemId }: SetItemLabelsRequestParamsDTO,
    @Body() { labels }: SetItemLabelsRequestBodyDTO,
  ): Promise<void> {
    try {
      const item = await this.service.findOneByIdOrFail(itemId)

      if (item.listId !== listId) {
        throw new NotFoundError(`No list item found for ID "${itemId}"`)
      }

      await this.service.setLabels(item.id, labels)
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
