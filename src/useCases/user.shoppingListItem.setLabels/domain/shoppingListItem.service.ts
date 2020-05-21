import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async setLabels(id: string, labels: string[]): Promise<void> {
    await this.repository.setLabels(id, labels)
  }
}
