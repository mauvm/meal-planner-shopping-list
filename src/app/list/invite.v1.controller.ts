import { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import {
  JsonController,
  Post,
  Body,
  Res,
  Authorized,
  CurrentUser,
  NotFoundError,
  BadRequestError,
} from 'routing-controllers'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { Response } from 'koa'
import HttpStatus from 'http-status-codes'
import UserEntity from '../../domain/user.entity'
import ListService from '../../domain/list/list.service'
import ListInviteService from '../../domain/list/listInvite.service'
import ListCreated from '../../domain/list/listCreated.event'

class InviteRequestParamsDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  code: string
}

@singleton()
@JsonController('/v1/lists/invite')
export default class ListInviteV1Controller {
  constructor(
    private listService: ListService,
    private listInviteService: ListInviteService,
  ) {}

  @Authorized('lists:update')
  @Post('/')
  async create(
    @CurrentUser() user: UserEntity,
    @Body() data: InviteRequestParamsDTO,
    @Res() res: Response,
  ): Promise<Response> {
    let listId: string = 'unknown'

    try {
      listId = this.listInviteService.getListIdFromInviteCode(data.code)
      const list = await this.listService.findOneByIdOrFail(listId)

      if (!list.hasOwner(user)) {
        list.addOwner(user)
        await this.listService.updateListOwners(list, user)
      }

      res.status = HttpStatus.ACCEPTED
      res.body = {}

      return res
    } catch (err) {
      if (err instanceof AssertionError && err.expected === ListCreated.name) {
        throw new NotFoundError(`No list found for ID "${listId}"`)
      }

      throw new BadRequestError(err.message)
    }
  }
}
