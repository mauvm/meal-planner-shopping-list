import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  Params,
  UnauthorizedError,
  NotFoundError,
  Authorized,
  CurrentUser,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import { plainToClass } from 'class-transformer'
import UserEntity from '../../domain/user.entity'
import ListService from '../../domain/list/list.service'
import ListItemService from '../../domain/listItem/listItem.service'
import ListCreated from '../../domain/list/listCreated.event'
import ListItemCreated from '../../domain/listItem/listItemCreated.event'
import ListItemEntity from '../../domain/listItem/listItem.entity'

class FetchRequestParamsDTO {
  @IsUUID()
  listId: string

  @IsUUID()
  itemId: string
}

class FetchResponseDTO {
  data: ListItemEntity
}

@singleton()
@JsonController('/v1/lists')
export default class FetchListItemV1Controller {
  constructor(
    private listService: ListService,
    private listItemService: ListItemService,
  ) {}

  @Authorized('list-items:fetch')
  @Get('/:listId/items/:itemId')
  async fetch(
    @CurrentUser() user: UserEntity,
    @Params() { listId, itemId }: FetchRequestParamsDTO,
  ): Promise<FetchResponseDTO> {
    try {
      const list = await this.listService.findOneByIdOrFail(listId)

      if (!list.hasOwner(user)) {
        throw new UnauthorizedError(`No access to list "${list.id}"`)
      }

      const item = await this.listItemService.findOneByIdOrFail(itemId)

      if (!list.hasItem(item)) {
        throw new NotFoundError(`No list item found for ID "${item.id}"`)
      }

      return plainToClass(FetchResponseDTO, { data: item })
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
