import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async setTitle(id: string, title: string): Promise<void> {
    await this.repository.setTitle(id, title)
  }
}
