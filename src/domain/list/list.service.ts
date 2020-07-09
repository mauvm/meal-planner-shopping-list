import { singleton } from 'tsyringe'
import ListEntity from './list.entity'
import UserEntity from '../user.entity'
import ListRepository from '../../infra/list/list.repository'

@singleton()
export default class ListService {
  constructor(private repository: ListRepository) {}

  async create(data: { title: string }, user: UserEntity): Promise<string> {
    const id = await this.repository.create(
      {
        title: data.title.trim(),
        owners: [user.id],
      },
      user,
    )

    return id
  }

  async findOneByIdOrFail(id: string): Promise<ListEntity> {
    const item = await this.repository.findOneOrFail(id)

    return item
  }

  async findAllForUser(user: UserEntity): Promise<ListEntity[]> {
    const lists = await this.repository.findAllForUser(user)

    // Oldest first
    lists.sort(
      (a, b) => Number(new Date(a.createdAt)) - Number(new Date(b.createdAt)),
    )

    return lists
  }
}
