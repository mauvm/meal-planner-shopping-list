import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async finish(id: string): Promise<void> {
    await this.repository.finish(id)
  }
}
