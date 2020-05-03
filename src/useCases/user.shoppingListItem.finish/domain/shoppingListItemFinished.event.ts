import { Event } from '../../../shared/infra/event.store'

export default class ShoppingListItemFinished extends Event {
  static readonly type = 'shoppingListItemFinished'
  readonly type = ShoppingListItemFinished.type

  readonly data: { finishedAt: string }

  applyTo(aggregate: any): void {
    aggregate.finishedAt = this.data.finishedAt
  }
}
