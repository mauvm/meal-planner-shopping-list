import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  Authorized,
  CurrentUser,
} from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import UserEntity from '../../domain/user.entity'
import ListEntity from '../../domain/list/list.entity'
import ListService from '../../domain/list/list.service'
import ListInviteService from '../../domain/list/listInvite.service'

class FetchResponseDTO {
  data: ListEntity[]
}

@singleton()
@JsonController('/v1/lists')
export default class FetchAllListV1Controller {
  constructor(
    private listService: ListService,
    private listInviteService: ListInviteService,
  ) {}

  @Authorized('lists:fetch')
  @Get('/')
  async fetchAll(@CurrentUser() user: UserEntity): Promise<FetchResponseDTO> {
    const lists = await this.listService.findAllForUser(user)

    for (const list of lists) {
      try {
        list.inviteCode = this.listInviteService.createInviteCode(list)
      } catch (err) {
        // Fail silently: don't break fetching lists when invite codes aren't configured
      }
    }

    return plainToClass(FetchResponseDTO, { data: lists })
  }
}
