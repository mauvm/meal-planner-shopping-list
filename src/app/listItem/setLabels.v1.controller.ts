import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Put,
  OnUndefined,
  Params,
  Body,
  UnauthorizedError,
  NotFoundError,
  Authorized,
  CurrentUser,
} from 'routing-controllers'
import { IsUUID, IsArray, IsString, IsNotEmpty } from 'class-validator'
import HttpStatus from 'http-status-codes'
import UserEntity from '../../domain/user.entity'
import ListService from '../../domain/list/list.service'
import ListItemService from '../../domain/listItem/listItem.service'
import ListCreated from '../../domain/list/listCreated.event'
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
  constructor(
    private listService: ListService,
    private listItemService: ListItemService,
  ) {}

  @Authorized('list-items:update')
  @Put('/:listId/items/:itemId/labels')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async fetch(
    @CurrentUser() user: UserEntity,
    @Params() { listId, itemId }: SetItemLabelsRequestParamsDTO,
    @Body() { labels }: SetItemLabelsRequestBodyDTO,
  ): Promise<void> {
    try {
      const list = await this.listService.findOneByIdOrFail(listId)

      if (!list.hasOwner(user)) {
        throw new UnauthorizedError(`No access to list "${list.id}"`)
      }

      const item = await this.listItemService.findOneByIdOrFail(itemId)

      if (!list.hasItem(item)) {
        throw new NotFoundError(`No list item found for ID "${item.id}"`)
      }

      await this.listItemService.setLabels(item.id, labels, user)
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

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
