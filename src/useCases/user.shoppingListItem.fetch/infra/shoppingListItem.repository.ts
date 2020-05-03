import { singleton } from 'tsyringe'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import { plainToClass } from 'class-transformer'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  async findOne(id: string): Promise<ShoppingListItemEntity | undefined> {
    const aggregate = this.shoppingListItemStore.getAggregateById(id)

    if (!aggregate) {
      return undefined
    }

    const item = plainToClass(ShoppingListItemEntity, aggregate.data)

    // @todo Validate instance

    return item
  }
}
