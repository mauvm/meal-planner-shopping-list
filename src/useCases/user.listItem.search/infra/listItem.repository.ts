import { singleton } from 'tsyringe'
import { plainToClass } from 'class-transformer'
import ListItemStore from '../../../shared/infra/listItem.store'
import ListItemEntity from '../../../shared/domain/listItem.entity'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  searchItems(query: string): ListItemEntity[] {
    const aggregates = Array.from(
      this.listItemStore.getAggregates().values(),
    ).filter((item: any) =>
      item.data.title?.toLowerCase().includes(query.toLowerCase()),
    )

    return (
      aggregates
        .map((aggregate) => plainToClass(ListItemEntity, aggregate.data))
        // Sort by created at (descending)
        .sort(
          (item1, item2) =>
            Number(new Date(item2.createdAt)) -
            Number(new Date(item1.createdAt)),
        )
    )
  }
}
