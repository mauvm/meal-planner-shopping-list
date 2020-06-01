import { singleton } from 'tsyringe'
import ShoppingListItemFinished from '../domain/shoppingListItemFinished.event'
import EventStore from '../../../shared/infra/event.store'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'

@singleton()
export default class ShoppingListItemRepository {
  constructor(
    private shoppingListItemStore: ShoppingListItemStore,
    private eventStore: EventStore,
  ) {}

  async finish(aggregateId: string): Promise<void> {
    this.shoppingListItemStore.assertObservedEvent(
      aggregateId,
      ShoppingListItemCreated,
    )

    const event = new ShoppingListItemFinished(null, aggregateId, {
      finishedAt: new Date().toISOString(),
    })

    await this.eventStore.persistEvent('shopping-list-items', event)
  }
}
