import { singleton } from 'tsyringe'
import EventStore, { Event } from './event.store'
import AutoLoadableStore from './autoLoadableStore.interface'
import { AssertionError } from 'assert'

export type Aggregate = {
  data: any
  events: Event[]
}

@singleton()
export default class ShoppingListItemStore implements AutoLoadableStore {
  // @todo Research how to replace this map.
  //       Use read-optimized view creator or snapshots maybe?
  private aggregates: Map<string, Aggregate> = new Map()

  constructor(private eventStore: EventStore) {}

  async init() {
    // Update entity map by events
    this.eventStore.catchUpStream('shopping-list-items', (event: Event) => {
      this.handleEvent(event)
    })
  }

  async cleanUp() {}

  handleEvent(event: Event) {
    const aggregate = this.aggregates.get(event.id) || {
      data: {},
      events: [],
    }

    event.applyTo(aggregate.data)
    aggregate.events.push(event)

    this.aggregates.set(event.id, aggregate)
  }

  getAggregateById(id: string): any | undefined {
    return this.aggregates.get(id)
  }

  getAggregates(): Map<string, Aggregate> {
    return this.aggregates
  }

  assertObservedEvent(id: string, eventClass: typeof Event): void {
    const aggregate = this.aggregates.get(id)

    if (!aggregate) {
      throw new AssertionError({
        message: `No events observed for ID "${id}"!`,
        expected: eventClass.name,
      })
    }

    if (!aggregate.events.some((event) => event instanceof eventClass)) {
      throw new AssertionError({
        message: `Event not observed for ID "${id}"!`,
        expected: eventClass.name,
      })
    }
  }
}
