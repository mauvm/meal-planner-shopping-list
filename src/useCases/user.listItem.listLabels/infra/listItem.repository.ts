import { singleton } from 'tsyringe'
import ListItemStore from '../../../shared/infra/listItem.store'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  listLabels(): string[] {
    const labels: string[] = []

    for (const aggregate of this.listItemStore.getAggregates().values()) {
      if (Array.isArray(aggregate.data.labels)) {
        labels.push(...aggregate.data.labels)
      }
    }

    return labels
      .sort()
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
  }
}
