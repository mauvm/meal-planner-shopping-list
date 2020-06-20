import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  Params,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { AssertionError } from 'assert'
import ListItemService from '../domain/listItem.service'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'
import ListItemEntity from '../../../shared/domain/listItem.entity'

class FetchRequestParamsDTO {
  @IsUUID()
  id: string
}

class FetchResponseDTO {
  data: ListItemEntity
}

@singleton()
@JsonController('/v1/lists/items')
export default class FetchListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Get('/:id')
  async fetch(
    @Params() { id }: FetchRequestParamsDTO,
  ): Promise<FetchResponseDTO> {
    try {
      const item = await this.service.findOneByIdOrFail(id)

      return plainToClass(FetchResponseDTO, { data: item })
    } catch (err) {
      if (
        err instanceof AssertionError &&
        err.expected === ListItemCreated.name
      ) {
        throw new BadRequestError(`No list item found for ID "${id}"`)
      }

      throw err
    }
  }
}
