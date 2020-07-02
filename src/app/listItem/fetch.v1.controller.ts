import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import { JsonController, Get, Params, NotFoundError } from 'routing-controllers'
import { IsUUID } from 'class-validator'
import { plainToClass } from 'class-transformer'
import ListItemService from '../../domain/listItem/listItem.service'
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
  constructor(private service: ListItemService) {}

  @Get('/:listId/items/:itemId')
  async fetch(
    @Params() { listId, itemId }: FetchRequestParamsDTO,
  ): Promise<FetchResponseDTO> {
    try {
      const item = await this.service.findOneByIdOrFail(itemId)

      if (item.listId !== listId) {
        throw new NotFoundError(`No list item found for ID "${itemId}"`)
      }

      return plainToClass(FetchResponseDTO, { data: item })
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
