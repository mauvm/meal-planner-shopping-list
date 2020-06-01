import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'
import EventStore from '../../../shared/infra/event.store'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private eventStore: EventStore) {}

  async create(data: { title: string }): Promise<string> {
    const aggregateId = uuid()
    const event = new ShoppingListItemCreated(null, aggregateId, data)

    // @todo Assert that aggregate ID is not in use

    // @todo Move stream name to ShoppingListItemStore (also other occurences outside of the store)
    await this.eventStore.persistEvent('shopping-list-items', event)

    return aggregateId
  }
}
