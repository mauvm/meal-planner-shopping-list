import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  Params,
  Authorized,
  CurrentUser,
  UnauthorizedError,
  NotFoundError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import UserEntity from '../../domain/user.entity'
import ListService from '../../domain/list/list.service'
import ListItemService from '../../domain/listItem/listItem.service'
import ListCreated from '../../domain/list/listCreated.event'

class FetchItemsLabelsRequestParamsDTO {
  @IsUUID()
  listId: string
}

class FetchItemsLabelsResponseDTO {
  data: string[]
}

@singleton()
@JsonController('/v1/lists')
export default class ListItemLabelsV1Controller {
  constructor(
    private listService: ListService,
    private listItemService: ListItemService,
  ) {}

  @Authorized('list-items:fetch')
  @Get('/:listId/items-labels')
  async fetchItemsLabels(
    @CurrentUser() user: UserEntity,
    @Params() { listId }: FetchItemsLabelsRequestParamsDTO,
  ): Promise<FetchItemsLabelsResponseDTO> {
    try {
      const list = await this.listService.findOneByIdOrFail(listId)

      if (!list.hasOwner(user)) {
        throw new UnauthorizedError(`No access to list "${list.id}"`)
      }

      const labels = this.listItemService.fetchAllListLabels(list.id)

      return { data: labels }
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

      throw err
    }
  }
}
