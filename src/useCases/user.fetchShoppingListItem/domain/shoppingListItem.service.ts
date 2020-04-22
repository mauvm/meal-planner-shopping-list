import { singleton } from 'tsyringe'
import ShoppingListItemEntity from './shoppingListItem.entity'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async findOneByIdOrFail(uuid: string): Promise<ShoppingListItemEntity> {
    const item = await this.repository.findOne(uuid)

    if (!item) {
      throw new Error(`Shopping list item "${uuid}" not found!`)
    }

    return item
  }
}
