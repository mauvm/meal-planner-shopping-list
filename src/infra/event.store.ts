import { singleton } from 'tsyringe'
import {
  createConnection,
  createJsonEventData,
  EventStoreNodeConnection,
  expectedVersion,
  UserCredentials,
} from 'node-eventstore-client'
import { uuid } from 'uuidv4'
import LoggerService from '../domain/logger.service'
import AutoLoadableStore from './autoLoadableStore.interface'

export class Event {
  static readonly type: string
  // @todo Remove this by determining class constructor from instance and then get static type
  readonly type: string // Add: readonly type = MyEventClass.type

  constructor(
    readonly eventId: string | null,
    readonly aggregateId: string,
    readonly data: any = {},
  ) {
    this.data.id = aggregateId
  }

  applyTo(data: any): void {
    Object.assign(data, this.data)
  }
}

export type EventCallback = (event: Event) => void

const eventClasses: typeof Event[] = []

export function registerEventClass(eventClass: typeof Event) {
  eventClasses.push(eventClass)
}

@singleton()
export default class EventStore implements AutoLoadableStore {
  private client: EventStoreNodeConnection

  constructor(private logger: LoggerService) {}

  async init() {
    // @todo Improve authentication
    const username = 'admin'
    const password = 'changeit'
    const host = process.env.EVENT_STORE_SERVICE_SERVICE_HOST || 'localhost'
    const port = Number(
      process.env.EVENT_STORE_SERVICE_SERVICE_PORT_TCP_CLIENT_API || 1113,
    )

    this.client = createConnection(
      {
        // log: {
        //   debug: (fmt, ...args) => {
        //     this.logger.debug(`EventStore: ${fmt}`, args)
        //   },
        //   info: (fmt, ...args) => {
        //     this.logger.info(`EventStore: ${fmt}`, args)
        //   },
        //   error: (fmt, ...args) => {
        //     this.logger.error(`EventStore: ${fmt}`, args)
        //   },
        // },
        defaultUserCredentials: new UserCredentials(username, password),
        maxReconnections: -1, // No limit
      },
      `tcp://${host}:${port}`,
    )

    this.client.once('connected', () => {
      this.logger.debug('EventStore connected', { host, port })
    })
    // this.client.on('heartbeatInfo', (info) => {
    //   this.logger.debug('Heartbeat from EventStore', { info })
    // })
    this.client.once('error', (err) => {
      this.logger.error(`EventStore error: ${err.message}`)
    })
    this.client.once('closed', (reason) => {
      this.logger.debug('EventStore connection closed', { reason })
    })

    await this.client.connect()
  }

  async cleanUp() {
    this.client.close()
  }

  async persistEvent(streamName: string, event: Event): Promise<string> {
    const eventToStore = createJsonEventData(
      uuid(),
      event.data,
      undefined,
      event.type,
    )

    this.logger.debug(`Appending ${streamName}:${eventToStore.type} event..`, {
      streamName,
      event,
      eventToStore: {
        eventId: eventToStore.eventId,
        type: eventToStore.type,
        isJSON: eventToStore.isJson,
        // Log as base64 instead of byte array (Buffer)
        dataBase64: eventToStore.data.toString('base64'),
        metadataBase64: eventToStore.metadata.toString('base64'),
      },
    })

    const writeResult = await this.client.appendToStream(
      streamName,
      expectedVersion.any,
      eventToStore,
    )

    this.logger.debug(`Appended ${streamName}:${event.type} event`, {
      event,
      storedEventId: eventToStore.eventId,
      writeResult,
    })

    return eventToStore.eventId
  }

  catchUpStream(streamName: string, callback: EventCallback): void {
    this.client.subscribeToAllFrom(null, false, (subscription, event) => {
      if (event?.originalEvent?.eventStreamId !== streamName) {
        return
      }

      const eventId = event!.event!.eventId
      const type = String(event!.event!.eventType)
      const data = JSON.parse(event!.event!.data!.toString('utf8'))

      let eventClass = eventClasses.find(
        (eventClass) =>
          eventClass.type === type ||
          // @todo Remove this dirty fix for shopping-list to list service rename
          `shopping-${eventClass.type}` === type,
      )

      if (!eventClass) {
        this.logger.error(`No event handler for "${type}"`, {
          streamName,
          eventId,
          type,
          data,
        })
        return
      }

      const observedEvent = new eventClass(eventId, data.id, data)
      callback(observedEvent)
    })
  }
}
