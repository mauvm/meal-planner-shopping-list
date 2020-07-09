import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import { IsUUID } from 'class-validator'
import {
  JsonController,
  Get,
  Params,
  UnauthorizedError,
  NotFoundError,
  Authorized,
  CurrentUser,
} from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import UserEntity from '../../domain/user.entity'
import ListService from '../../domain/list/list.service'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemEntity from '../../domain/listItem/listItem.entity'
import ListCreated from '../../domain/list/listCreated.event'

class ListUnfinishedRequestParamsDTO {
  @IsUUID()
  listId: string
}

class ListUnfinishedResponseDTO {
  data: ListItemEntity[]
}

@singleton()
@JsonController('/v1/lists')
export default class ListUnfinishedListItemV1Controller {
  constructor(
    private listService: ListService,
    private listItemService: ListItemService,
  ) {}

  @Authorized('list-items:fetch')
  @Get('/:listId/unfinished-items')
  async listUnfinished(
    @CurrentUser() user: UserEntity,
    @Params() { listId }: ListUnfinishedRequestParamsDTO,
  ): Promise<ListUnfinishedResponseDTO> {
    try {
      const list = await this.listService.findOneByIdOrFail(listId)

      if (!list.hasOwner(user)) {
        throw new UnauthorizedError(`No access to list "${list.id}"`)
      }

      const items = await this.listItemService.findAllUnfinished(list.id)

      return plainToClass(ListUnfinishedResponseDTO, { data: items })
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

      throw err
    }
  }
}
