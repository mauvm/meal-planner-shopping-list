import { singleton } from 'tsyringe'
import ShoppingListItemStore from '../../../shared/infra/shoppingListItem.store'

@singleton()
export default class ShoppingListItemRepository {
  constructor(private shoppingListItemStore: ShoppingListItemStore) {}

  listLabels(): string[] {
    const labels: string[] = []

    for (const aggregate of this.shoppingListItemStore
      .getAggregates()
      .values()) {
      if (Array.isArray(aggregate.data.labels)) {
        labels.push(...aggregate.data.labels)
      }
    }

    return labels
      .sort()
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
  }
}
