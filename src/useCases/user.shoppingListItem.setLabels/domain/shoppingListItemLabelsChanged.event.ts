import { Event } from '../../../shared/infra/event.store'

export default class ShoppingListItemLabelsChanged extends Event {
  static readonly type = 'shopping-list-item-labels-changed'
  readonly type = ShoppingListItemLabelsChanged.type

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
