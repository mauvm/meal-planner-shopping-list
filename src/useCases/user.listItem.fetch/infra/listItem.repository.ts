import { singleton } from 'tsyringe'
import { plainToClass } from 'class-transformer'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'
import ListItemEntity from '../../../shared/domain/listItem.entity'
import ListItemStore from '../../../shared/infra/listItem.store'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async findOneOrFail(aggregateId: string): Promise<ListItemEntity> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const aggregate = this.listItemStore.getAggregateById(aggregateId)
    const item = plainToClass(ListItemEntity, aggregate.data)

    // @todo Validate instance

    return item
  }
}
