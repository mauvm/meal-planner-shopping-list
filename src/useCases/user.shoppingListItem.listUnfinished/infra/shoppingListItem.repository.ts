import { singleton } from 'tsyringe'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import temporaryDatabase from '../../../shared/infra/temporaryDatabase'

@singleton()
export default class ShoppingListItemRepository {
  async findAllUnfinished(): Promise<ShoppingListItemEntity[]> {
    return Array.from(temporaryDatabase.shoppingListItems.values())
  }
}
