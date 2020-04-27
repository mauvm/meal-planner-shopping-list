import { singleton } from 'tsyringe'
import temporaryDatabase from '../../../shared/infra/temporaryDatabase'

@singleton()
export default class ShoppingListItemRepository {
  async finish(uuid: string): Promise<void> {
    const item = temporaryDatabase.shoppingListItems.get(uuid)

    if (!item) {
      throw new Error(`No shopping list item with ID "${uuid}"`)
    }

    item.finishedAt = new Date()
  }
}
