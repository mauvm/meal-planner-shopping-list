import assert, { AssertionError } from 'assert'
import { singleton } from 'tsyringe'
import { EventEmitter } from 'typed-ts-events'
import EventStore, { Event } from './event.store'
import AutoLoadableStore from './autoLoadableStore.interface'

export type Aggregate = {
  data: any
  events: Event[]
}

@singleton()
export default class ShoppingListItemStore implements AutoLoadableStore {
  // @todo Research how to replace this map.
  //       Use read-optimized view creator or snapshots maybe?
  private aggregates: Map<string, Aggregate> = new Map()

  constructor(
    private eventStore: EventStore,
    private handledEvents: EventEmitter<{ [eventId: string]: Event }>,
  ) {}

  async init() {
    // Update entity map by events
    this.eventStore.catchUpStream('shopping-list-items', (event: Event) => {
      this.handleEvent(event)
    })
  }

  async cleanUp() {}

  handleEvent(event: Event) {
    assert.ok(event.eventId, 'Event has no eventId')

    const aggregate = this.aggregates.get(event.aggregateId) || {
      data: {},
      events: [],
    }

    event.applyTo(aggregate.data)
    aggregate.events.push(event)

    this.aggregates.set(event.aggregateId, aggregate)

    this.handledEvents.trigger(event.eventId, event)
  }

  getAggregateById(aggregateId: string): any | undefined {
    return this.aggregates.get(aggregateId)
  }

  getAggregates(): Map<string, Aggregate> {
    return this.aggregates
  }

  assertObservedEvent(aggregateId: string, eventClass: typeof Event): void {
    const aggregate = this.aggregates.get(aggregateId)

    if (!aggregate) {
      throw new AssertionError({
        message: `No events observed for aggregate ID "${aggregateId}"`,
        expected: eventClass.name,
      })
    }

    if (!aggregate.events.some((event) => event instanceof eventClass)) {
      throw new AssertionError({
        message: `Event not observed for aggregate ID "${aggregateId}"`,
        expected: eventClass.name,
      })
    }
  }

  async waitForEventFromStore(
    eventId: string,
    timeoutMs = 3 * 1000,
  ): Promise<Event> {
    assert.ok(eventId, 'Event has no eventId')

    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout
      let handler: EventEmitter.IHandler<Event, ShoppingListItemStore>

      // Start timeout timer
      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          this.handledEvents.off(handler)
          reject(new Error(`Waiting for event ${eventId} timed out`))
        }, timeoutMs)
      }

      // Wait for event
      handler = (observedEvent: Event) => {
        clearTimeout(timer)
        resolve(observedEvent)
      }
      this.handledEvents.once(eventId, handler)
    })
  }

  async persistEvent(event: Event): Promise<void> {
    const eventId = await this.eventStore.persistEvent(
      'shopping-list-items',
      event,
    )
    await this.waitForEventFromStore(eventId)
  }
}
