import { Event } from '../../infra/event.store'

export default class ListItemTitleChanged extends Event {
  static readonly type = 'list-item-title-changed'
  readonly type = ListItemTitleChanged.type

  readonly data: { id: string; title: string }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data = {},
  ) {
    super(eventId, aggregateId, data)
  }

  applyTo(aggregate: any): void {
    this.assertAggregateId(aggregate)

    aggregate.title = this.data.title
  }
}
