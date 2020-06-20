import { singleton } from 'tsyringe'
import ListItemFinished from '../domain/listItemFinished.event'
import ListItemStore from '../../../shared/infra/listItem.store'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async finish(aggregateId: string): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemFinished(null, aggregateId, {
      finishedAt: new Date().toISOString(),
    })

    await this.listItemStore.persistEvent(event)
  }
}
