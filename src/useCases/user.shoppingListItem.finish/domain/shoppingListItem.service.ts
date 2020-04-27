import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async finish(uuid: string): Promise<void> {
    await this.repository.finish(uuid)
  }
}
