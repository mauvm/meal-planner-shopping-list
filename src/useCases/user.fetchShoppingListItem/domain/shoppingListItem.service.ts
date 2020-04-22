import { singleton } from 'tsyringe'
import ShoppingListItemEntity from './shoppingListItem.entity'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async findOneByIdOrFail(id: string): Promise<ShoppingListItemEntity> {
    const item = await this.repository.findOne(id)

    if (!item) {
      throw new Error(`Shopping list item "${id}" not found!`)
    }

    return item
  }
}
