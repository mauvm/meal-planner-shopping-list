import { singleton } from 'tsyringe'
import ShoppingListItemTitleChanged from '../domain/shoppingListItemTitleChanged.event'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  async setTitle(aggregateId: string, title: string): Promise<void> {
    this.shoppingListItemStore.assertObservedEvent(
      aggregateId,
      ShoppingListItemCreated,
    )

    const event = new ShoppingListItemTitleChanged(null, aggregateId, {
      title,
    })

    await this.shoppingListItemStore.persistEvent(event)
  }
}
