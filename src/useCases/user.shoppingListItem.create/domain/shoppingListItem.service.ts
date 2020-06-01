import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async create(data: { title: string }): Promise<string> {
    data.title = data.title.trim()

    return this.repository.create(data)
  }
}
