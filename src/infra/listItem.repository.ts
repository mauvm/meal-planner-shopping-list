import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListItemCreated from '../domain/listItemCreated.event'
import ListItemStore from '../infra/listItem.store'
import ListItemEntity from '../domain/listItem.entity'
import ListItemFinished from '../domain/listItemFinished.event'
import ListItemLabelsChanged from '../domain/listItemLabelsChanged.event'
import ListItemTitleChanged from '../domain/listItemTitleChanged.event'

@singleton()
export default class ListItemRepository {
  constructor(private listItemStore: ListItemStore) {}

  async create(data: { title: string }): Promise<string> {
    const aggregateId = uuid()
    const event = new ListItemCreated(null, aggregateId, data)

    // @todo Assert that aggregate ID is not in use

    await this.listItemStore.persistEvent(event)

    return aggregateId
  }

  async findOneOrFail(aggregateId: string): Promise<ListItemEntity> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const aggregate = this.listItemStore.getAggregateById(aggregateId)
    const item = plainToClass(ListItemEntity, aggregate.data)

    // @todo Validate instance

    return item
  }

  async finish(aggregateId: string): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemFinished(null, aggregateId, {
      finishedAt: new Date().toISOString(),
    })

    await this.listItemStore.persistEvent(event)
  }

  listLabels(): string[] {
    const labels: string[] = []

    for (const aggregate of this.listItemStore.getAggregates().values()) {
      if (Array.isArray(aggregate.data.labels)) {
        labels.push(...aggregate.data.labels)
      }
    }

    return labels
      .sort()
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
  }

  async findAllUnfinished(): Promise<ListItemEntity[]> {
    const aggregates = Array.from(
      this.listItemStore.getAggregates().values(),
    ).filter((item: any) => !item.data.finishedAt)

    return aggregates.map((aggregate) =>
      plainToClass(ListItemEntity, aggregate.data),
    )
  }

  searchItems(query: string): ListItemEntity[] {
    const aggregates = Array.from(
      this.listItemStore.getAggregates().values(),
    ).filter((item: any) =>
      item.data.title?.toLowerCase().includes(query.toLowerCase()),
    )

    return aggregates.map((aggregate) =>
      plainToClass(ListItemEntity, aggregate.data),
    )
  }

  async setLabels(aggregateId: string, labels: string[]): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemLabelsChanged(null, aggregateId, {
      labels: labels.sort(),
    })

    await this.listItemStore.persistEvent(event)
  }

  async setTitle(aggregateId: string, title: string): Promise<void> {
    this.listItemStore.assertObservedEvent(aggregateId, ListItemCreated)

    const event = new ListItemTitleChanged(null, aggregateId, {
      title,
    })

    await this.listItemStore.persistEvent(event)
  }
}
