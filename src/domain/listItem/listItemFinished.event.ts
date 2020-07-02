import { Event } from '../../infra/event.store'

export default class ListItemFinished extends Event {
  static readonly type = 'list-item-finished'
  readonly type = ListItemFinished.type

  readonly data: { id: string; finishedAt: string }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data = {},
  ) {
    super(eventId, aggregateId, data)

    if (!this.data.finishedAt) {
      this.data.finishedAt = new Date().toISOString()
    }
  }

  applyTo(aggregate: any): void {
    aggregate.finishedAt = this.data.finishedAt
  }
}
