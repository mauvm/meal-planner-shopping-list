import { Event } from '../../../shared/infra/event.store'

export default class ShoppingListItemTitleChanged extends Event {
  static readonly type = 'shopping-list-item-title-changed'
  readonly type = ShoppingListItemTitleChanged.type

  readonly data: { id: string; title: string }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data = {},
  ) {
    super(eventId, aggregateId, data)
  }

  applyTo(aggregate: any): void {
    aggregate.title = this.data.title
  }
}
