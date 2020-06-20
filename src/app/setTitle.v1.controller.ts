import { singleton } from 'tsyringe'
import {
  JsonController,
  Patch,
  OnUndefined,
  Params,
  Body,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID, IsString } from 'class-validator'
import HttpStatus from 'http-status-codes'
import { AssertionError } from 'assert'
import ListItemService from '../domain/listItem.service'
import ListItemCreated from '../domain/listItemCreated.event'

class SetItemTitleRequestParamsDTO {
  @IsUUID()
  id: string
}

class SetItemTitleRequestBodyDTO {
  @IsString()
  title: string
}

@singleton()
@JsonController('/v1/lists/items')
export default class SetListItemTitleV1Controller {
  constructor(private service: ListItemService) {}

  @Patch('/:id')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async update(
    @Params() { id }: SetItemTitleRequestParamsDTO,
    @Body() { title }: SetItemTitleRequestBodyDTO,
  ): Promise<void> {
    try {
      await this.service.setTitle(id, title)
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
