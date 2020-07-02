import { singleton } from 'tsyringe'
import ListEntity from './list.entity'
import ListRepository from '../../infra/list/list.repository'

@singleton()
export default class ListService {
  constructor(private repository: ListRepository) {}

  async create(data: { title: string }): Promise<string> {
    data.title = data.title.trim()

    const id = await this.repository.create(data)

    return id
  }

  async findOneByIdOrFail(id: string): Promise<ListEntity> {
    const item = await this.repository.findOneOrFail(id)

    return item
  }

  async findAll(): Promise<ListEntity[]> {
    const lists = await this.repository.findAll()

    return lists
  }
}
