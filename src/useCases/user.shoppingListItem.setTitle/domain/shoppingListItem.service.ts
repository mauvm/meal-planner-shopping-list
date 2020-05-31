import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async setTitle(id: string, title: string): Promise<void> {
    await this.repository.setTitle(id, title)
  }
}
