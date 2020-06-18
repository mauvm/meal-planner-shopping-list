import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'
import ShoppingListItemCreated from '../../../shared/domain/shoppingListItemCreated.event'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  async create(data: { title: string }): Promise<string> {
    const aggregateId = uuid()
    const event = new ShoppingListItemCreated(null, aggregateId, data)

    // @todo Assert that aggregate ID is not in use

    await this.shoppingListItemStore.persistEvent(event)

    return aggregateId
  }
}
