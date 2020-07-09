import { singleton } from 'tsyringe'
import {
  JsonController,
  Get,
  Authorized,
  CurrentUser,
} from 'routing-controllers'
import { plainToClass } from 'class-transformer'
import ListService from '../../domain/list/list.service'
import ListEntity from '../../domain/list/list.entity'
import UserEntity from '../../domain/user.entity'

class FetchResponseDTO {
  data: ListEntity[]
}

@singleton()
@JsonController('/v1/lists')
export default class FetchAllListV1Controller {
  constructor(private service: ListService) {}

  @Authorized('lists:fetch')
  @Get('/')
  async fetchAll(@CurrentUser() user: UserEntity): Promise<FetchResponseDTO> {
    const lists = await this.service.findAllForUser(user)

    return plainToClass(FetchResponseDTO, { data: lists })
  }
}
