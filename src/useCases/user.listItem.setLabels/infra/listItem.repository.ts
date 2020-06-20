import { singleton } from 'tsyringe'
import ListItemLabelsChanged from '../domain/listItemLabelsChanged.event'
import ListItemStore from '../../../shared/infra/listItem.store'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async setLabels(aggregateId: string, labels: string[]): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemLabelsChanged(null, aggregateId, {
      labels: labels.sort(),
    })

    await this.listItemStore.persistEvent(event)
  }
}
