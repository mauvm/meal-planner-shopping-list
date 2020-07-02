import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  OnUndefined,
  Params,
  Body,
  BadRequestError,
} from 'routing-controllers'
import { IsUUID, IsArray, IsString, IsNotEmpty } from 'class-validator'
import HttpStatus from 'http-status-codes'
import ListItemService from '../../domain/listItem/listItem.service'
import ListItemCreated from '../../domain/listItem/listItemCreated.event'

class SetItemLabelsRequestParamsDTO {
  @IsUUID()
  id: string
}

class SetItemLabelsRequestBodyDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  labels: string[] = []
}

@singleton()
@JsonController('/v1/lists/items')
export default class SetListItemLabelsV1Controller {
  constructor(private service: ListItemService) {}

  @Post('/:id/set-labels')
  @OnUndefined(HttpStatus.NO_CONTENT)
  async fetch(
    @Params() { id }: SetItemLabelsRequestParamsDTO,
    @Body() { labels }: SetItemLabelsRequestBodyDTO,
  ): Promise<void> {
    try {
      await this.service.setLabels(id, labels)
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
