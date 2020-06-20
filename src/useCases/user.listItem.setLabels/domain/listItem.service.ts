import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async setLabels(id: string, labels: string[]): Promise<void> {
    const trimmedLabels = labels.map((label) => label.trim()).filter(Boolean)

    await this.repository.setLabels(id, trimmedLabels)
  }
}
