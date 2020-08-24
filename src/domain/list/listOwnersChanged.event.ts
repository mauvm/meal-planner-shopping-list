import { UserId } from '../user.entity'
import { Event } from '../../infra/event.store'

export default class ListOwnersChanged extends Event {
  static readonly type = 'list-owners-changed'
  readonly type = ListOwnersChanged.type

  readonly data: { id: string; owners: UserId[] }

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    data: { owners: UserId[] },
  ) {
    super(eventId, aggregateId, data)
  }

  applyTo(aggregate: any): void {
    this.assertAggregateId(aggregate)

    aggregate.owners = this.data.owners
  }
}
