import { Event } from '../../infra/event.store'

export default class ListItemLabelsChanged extends Event {
  static readonly type = 'list-item-labels-changed'
  readonly type = ListItemLabelsChanged.type

  readonly data: { id: string; labels: string[] }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data = {},
  ) {
    super(eventId, aggregateId, data)
  }

  applyTo(aggregate: any): void {
    aggregate.labels = this.data.labels
  }
}
