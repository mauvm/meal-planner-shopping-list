import { Event } from '../../../shared/infra/event.store'

export default class ShoppingListItemFinished extends Event {
  static readonly type = 'shoppingListItemFinished'
  readonly type = ShoppingListItemFinished.type

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
