import { singleton } from 'tsyringe'
import ListItemTitleChanged from '../domain/listItemTitleChanged.event'
import ListItemStore from '../../../shared/infra/listItem.store'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async setTitle(aggregateId: string, title: string): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemTitleChanged(null, aggregateId, {
      title,
    })

    await this.listItemStore.persistEvent(event)
  }
}
