import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  async findOneByIdOrFail(id: string): Promise<ShoppingListItemEntity> {
    const item = await this.repository.findOneOrFail(id)
    return item
  }
}
