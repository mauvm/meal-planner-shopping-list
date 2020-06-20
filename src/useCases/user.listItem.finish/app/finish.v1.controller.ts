import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  OnUndefined,
  Params,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID } from 'class-validator'
import HttpStatus from 'http-status-codes'
import { AssertionError } from 'assert'
import ListItemService from '../domain/listItem.service'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'

class FinishRequestParamsDTO {
  @IsUUID()
  id: string
}

@singleton()
@JsonController('/v1/lists/items')
export default class FinishListItemV1Controller {
  constructor(private service: ListItemService) {}

  @Post('/:id/finish')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async finish(@Params() { id }: FinishRequestParamsDTO): Promise<void> {
    try {
      await this.service.finish(id)
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
