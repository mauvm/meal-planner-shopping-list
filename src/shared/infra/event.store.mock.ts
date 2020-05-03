import EventStore, { Event, EventCallback } from './event.store'
import { singleton } from 'tsyringe'

@singleton()
export default class EventMockStore extends EventStore {
  private streamListeners: Map<
    string,
    Array<(event: Event) => void>
  > = new Map()

  async init() {}
  async cleanUp() {}

  /**
   * This mock EventStore simply replays the persisted events
   * to the listeners that are registered via `catchUpStream()`.
   */
  async persistEvent(streamName: string, event: Event) {
    const listeners = this.streamListeners.get(streamName)

    if (!listeners) {
      return
    }

    for (const listener of listeners) {
      listener(event)
    }
  }

  catchUpStream(streamName: string, callback: EventCallback) {
    const listeners = this.streamListeners.get(streamName) || []
    listeners.push(callback)
    this.streamListeners.set(streamName, listeners)
  }
}
