import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  QueryParam,
  BadRequestError,
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
import ListCreated from '../../domain/list/listCreated.event'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemEntity from '../../domain/listItem/listItem.entity'

class SearchListItemRequestParamsDTO {
  @IsUUID()
  listId: string
}

class SearchItemsResponseDTO {
  data: ListItemEntity[]
}

@singleton()
@JsonController('/v1/lists')
export default class SearchListItemV1Controller {
  constructor(
    private listService: ListService,
    private listItemService: ListItemService,
  ) {}

  @Authorized('list-items:fetch')
  @Get('/:listId/search-items')
  async searchItems(
    @CurrentUser() user: UserEntity,
    @Params() { listId }: SearchListItemRequestParamsDTO,
    @QueryParam('query') query: string,
  ): Promise<SearchItemsResponseDTO> {
    if (!query) {
      throw new BadRequestError('Missing query parameter "query"')
    }

    try {
      const list = await this.listService.findOneByIdOrFail(listId)

      if (!list.hasOwner(user)) {
        throw new UnauthorizedError(`No access to list "${list.id}"`)
      }

      const items = this.listItemService.searchItems(list.id, query)

      return plainToClass(SearchItemsResponseDTO, { data: items })
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

      throw err
    }
  }
}
