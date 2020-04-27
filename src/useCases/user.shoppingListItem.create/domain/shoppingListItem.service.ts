import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async create(requestBody: { title: string }): Promise<string> {
    const data = {
      id: this.repository.createUUID(),
      title: requestBody.title,
    }

    await this.repository.create(data)

    return data.id
  }
}
