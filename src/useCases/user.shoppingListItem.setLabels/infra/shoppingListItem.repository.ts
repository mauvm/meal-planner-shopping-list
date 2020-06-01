import { singleton } from 'tsyringe'
import ShoppingListItemLabelsChanged from '../domain/shoppingListItemLabelsChanged.event'
import EventStore from '../../../shared/infra/event.store'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'

@singleton()
export default class ShoppingListItemRepository {
  constructor(
    private shoppingListItemStore: ShoppingListItemStore,
    private eventStore: EventStore,
  ) {}

  async setLabels(aggregateId: string, labels: string[]): Promise<void> {
    this.shoppingListItemStore.assertObservedEvent(
      aggregateId,
      ShoppingListItemCreated,
    )

    const event = new ShoppingListItemLabelsChanged(null, aggregateId, {
      labels: labels.sort(),
    })

    await this.eventStore.persistEvent('shopping-list-items', event)
  }
}
