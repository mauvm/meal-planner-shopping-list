import { singleton } from 'tsyringe'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import { plainToClass } from 'class-transformer'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  async findAllUnfinished(): Promise<ShoppingListItemEntity[]> {
    const aggregates = Array.from(
      this.shoppingListItemStore.getAggregates().values(),
    ).filter((item: any) => !item.finishedAt)

    return aggregates.map((aggregate) =>
      plainToClass(ShoppingListItemEntity, aggregate.data),
    )
  }
}
