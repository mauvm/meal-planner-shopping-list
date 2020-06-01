import { singleton } from 'tsyringe'
import ShoppingListItemCreated from '../../user.shoppingListItem.create/domain/shoppingListItemCreated.event'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import { plainToClass } from 'class-transformer'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  async findOneOrFail(aggregateId: string): Promise<ShoppingListItemEntity> {
    this.shoppingListItemStore.assertObservedEvent(
      aggregateId,
      ShoppingListItemCreated,
    )

    const aggregate = this.shoppingListItemStore.getAggregateById(aggregateId)
    const item = plainToClass(ShoppingListItemEntity, aggregate.data)

    // @todo Validate instance

    return item
  }
}
