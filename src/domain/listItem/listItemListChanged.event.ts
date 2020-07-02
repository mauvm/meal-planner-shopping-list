import { Event } from '../../infra/event.store'

export default class ListItemListChanged extends Event {
  static readonly type = 'list-item-list-changed'
  readonly type = ListItemListChanged.type

  readonly data: { id: string; listId: string }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data: { listId: string },
  ) {
    super(eventId, aggregateId, data)
  }

  applyTo(aggregate: any): void {
    Object.assign(aggregate, this.data)
  }
}
