import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async create(data: { title: string }): Promise<string> {
    data.title = data.title.trim()

    return this.repository.create(data)
  }
}
