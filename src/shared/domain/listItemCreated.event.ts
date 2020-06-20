import { Event } from '../infra/event.store'

export default class ListItemCreated extends Event {
  static readonly type = 'list-item-created'
  readonly type = ListItemCreated.type

  readonly data: { id: string; title: string; createdAt: string }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data: { title: string; createdAt?: string },
  ) {
    super(eventId, aggregateId, data)

    this.data.createdAt = data.createdAt || new Date().toISOString()
  }

  applyTo(aggregate: any): void {
    Object.assign(aggregate, this.data)
  }
}
