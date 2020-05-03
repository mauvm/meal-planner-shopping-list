import { Event } from '../../../shared/infra/event.store'

export default class ShoppingListItemCreated extends Event {
  static readonly type = 'shoppingListItemCreated'
  readonly type = ShoppingListItemCreated.type

  readonly data: { id: string; title: string; createdAt: string }

  constructor(readonly id: string, data: { title: string }) {
    super(id, data)
    this.data = { id, ...data, createdAt: new Date().toISOString() }
  }

  applyTo(aggregate: any): void {
    Object.assign(aggregate, this.data)
  }
}
