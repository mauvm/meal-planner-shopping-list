import { singleton } from 'tsyringe'
import { plainToClass } from 'class-transformer'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  searchItems(query: string): ShoppingListItemEntity[] {
    const aggregates = Array.from(
      this.shoppingListItemStore.getAggregates().values(),
    ).filter((item: any) =>
      item.data.title?.toLowerCase().includes(query.toLowerCase()),
    )

    return (
      aggregates
        .map((aggregate) =>
          plainToClass(ShoppingListItemEntity, aggregate.data),
        )
        // Sort by created at (descending)
        .sort(
          (item1, item2) =>
            Number(new Date(item2.createdAt)) -
            Number(new Date(item1.createdAt)),
        )
    )
  }
}
