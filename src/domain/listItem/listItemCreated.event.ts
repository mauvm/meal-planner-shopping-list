import { Event } from '../../infra/event.store'

export default class ListItemCreated extends Event {
  static readonly type = 'list-item-created'
  readonly type = ListItemCreated.type

  readonly data: {
    id: string
    listId?: string
    title: string
    createdAt: string
  }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data: { title: string; listId?: string; createdAt?: string },
  ) {
    super(eventId, aggregateId, data)

    this.data.createdAt = data.createdAt || new Date().toISOString()
  }

  applyTo(aggregate: any): void {
    // No need to assert aggregate ID, because this applyTo() will add it

    Object.assign(aggregate, this.data)
  }
}
