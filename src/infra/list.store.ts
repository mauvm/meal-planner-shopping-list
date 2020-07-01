import { singleton } from 'tsyringe'
import { EventEmitter } from 'typed-ts-events'
import BaseStore from './base.store'
import AutoLoadableStore from './autoLoadableStore.interface'
import EventStore, { Event } from './event.store'

@singleton()
export default class ListStore extends BaseStore implements AutoLoadableStore {
  protected readonly streamName: string = 'lists'

  constructor(
    eventStore: EventStore,
    handledEvents: EventEmitter<{ [eventId: string]: Event }>,
  ) {
    super(eventStore, handledEvents)
  }

  async init() {
    this.catchUpStream()
  }

  async cleanUp() {}
}
