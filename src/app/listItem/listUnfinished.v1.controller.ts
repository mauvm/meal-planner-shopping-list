import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import { IsUUID } from 'class-validator'
import { JsonController, Get, Params, NotFoundError } from 'routing-controllers'
import { plainToClass } from 'class-transformer'
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
  constructor(private service: ListItemService) {}

  @Get('/:listId/unfinished-items')
  async listUnfinished(
    @Params() { listId }: ListUnfinishedRequestParamsDTO,
  ): Promise<ListUnfinishedResponseDTO> {
    try {
      const items = await this.service.findAllUnfinished(listId)

      return plainToClass(ListUnfinishedResponseDTO, { data: items })
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

      throw err
    }
  }
}
