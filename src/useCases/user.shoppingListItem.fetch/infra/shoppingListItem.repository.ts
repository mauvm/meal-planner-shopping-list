import { singleton } from 'tsyringe'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import temporaryDatabase from '../../../shared/infra/temporaryDatabase'

@singleton()
export default class ShoppingListItemRepository {
  async findOne(id: string): Promise<ShoppingListItemEntity | undefined> {
    return temporaryDatabase.shoppingListItems.get(id)
  }
}
