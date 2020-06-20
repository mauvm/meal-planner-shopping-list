import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'
import ListItemCreated from '../../../shared/domain/listItemCreated.event'
import ListItemStore from '../../../shared/infra/listItem.store'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async create(data: { title: string }): Promise<string> {
    const aggregateId = uuid()
    const event = new ListItemCreated(null, aggregateId, data)

    // @todo Assert that aggregate ID is not in use

    await this.listItemStore.persistEvent(event)

    return aggregateId
  }
}
