import { singleton } from 'tsyringe'
import ListItemEntity from '../../../shared/domain/listItem.entity'
import ListItemStore from '../../../shared/infra/listItem.store'
import { plainToClass } from 'class-transformer'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async findAllUnfinished(): Promise<ListItemEntity[]> {
    const aggregates = Array.from(
      this.listItemStore.getAggregates().values(),
    ).filter((item: any) => !item.data.finishedAt)

    return aggregates.map((aggregate) =>
      plainToClass(ListItemEntity, aggregate.data),
    )
  }
}
