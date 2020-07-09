import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListStore from '../list/list.store'
import ListItemStore from './listItem.store'
import UserEntity from '../../domain/user.entity'
import ListCreated from '../../domain/list/listCreated.event'
import ListItemCreated from '../../domain/listItem/listItemCreated.event'
import ListItemEntity from '../../domain/listItem/listItem.entity'
import ListItemFinished from '../../domain/listItem/listItemFinished.event'
import ListItemLabelsChanged from '../../domain/listItem/listItemLabelsChanged.event'
import ListItemTitleChanged from '../../domain/listItem/listItemTitleChanged.event'

@singleton()
export default class ListItemRepository {
  constructor(
    private listStore: ListStore,
    private listItemStore: ListItemStore,
  ) {}

  async create(
    data: { listId: string; title: string },
    user: UserEntity,
  ): Promise<string> {
    this.listStore.assertObservedEvent(data.listId, ListCreated)

    const aggregateId = uuid()
    const event = new ListItemCreated(null, aggregateId, data)

    // @todo Assert that aggregate ID is not in use

    await this.listItemStore.persistEvent(event, user)

    return aggregateId
  }

  async findOneOrFail(aggregateId: string): Promise<ListItemEntity> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const aggregate = this.listItemStore.getAggregateById(aggregateId)
    const item = plainToClass(ListItemEntity, aggregate.data)

    // @todo Validate instance

    return item
  }

  fetchAllListLabels(listId: string): string[] {
    const labels: string[] = []

    for (const aggregate of this.listItemStore.getAggregates().values()) {
      if (
        aggregate.data.listId === listId &&
        Array.isArray(aggregate.data.labels)
      ) {
        labels.push(...aggregate.data.labels)
      }
    }

    return labels
      .sort()
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
  }

  async findAllUnfinished(listId: string): Promise<ListItemEntity[]> {
    this.listStore.assertObservedEvent(listId, ListCreated)

    const aggregates = Array.from(
      this.listItemStore.getAggregates().values(),
    ).filter(
      (item: any) => item.data.listId === listId && !item.data.finishedAt,
    )

    return aggregates.map((aggregate) =>
      plainToClass(ListItemEntity, aggregate.data),
    )
  }

  searchItems(listId: string, query: string): ListItemEntity[] {
    this.listStore.assertObservedEvent(listId, ListCreated)

    const aggregates = Array.from(
      this.listItemStore.getAggregates().values(),
    ).filter(
      (item: any) =>
        item.data.listId === listId &&
        item.data.title?.toLowerCase().includes(query.toLowerCase()),
    )

    return aggregates.map((aggregate) =>
      plainToClass(ListItemEntity, aggregate.data),
    )
  }

  async setLabels(
    aggregateId: string,
    labels: string[],
    user: UserEntity,
  ): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemLabelsChanged(null, aggregateId, {
      labels: labels.sort(),
    })

    await this.listItemStore.persistEvent(event, user)
  }

  async setTitle(
    aggregateId: string,
    title: string,
    user: UserEntity,
  ): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemTitleChanged(null, aggregateId, {
      title,
    })

    await this.listItemStore.persistEvent(event, user)
  }

  async finish(aggregateId: string, user: UserEntity): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemFinished(null, aggregateId, {
      finishedAt: new Date().toISOString(),
    })

    await this.listItemStore.persistEvent(event, user)
  }
}
