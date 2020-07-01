import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'
import ListItemEntity from './listItem.entity'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async create(data: { title: string }): Promise<string> {
    data.title = data.title.trim()

    const id = await this.repository.create(data)

    return id
  }

  async findOneByIdOrFail(id: string): Promise<ListItemEntity> {
    const item = await this.repository.findOneOrFail(id)
    return item
  }

  async findAllUnfinished(): Promise<ListItemEntity[]> {
    const items = await this.repository.findAllUnfinished()

    // Sort by creation datetime descending
    items.sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
    )

    return items
  }

  searchItems(query: string): ListItemEntity[] {
    let items = this.repository.searchItems(query)

    // Remove items with no labels when there are
    // other items with the same title that do have labels
    items = items.filter(
      (item) =>
        item.labels.length > 0 ||
        !items.some(
          (other) =>
            other.id !== item.id &&
            other.labels.length > 0 &&
            this.sameItemTitle(item, other),
        ),
    )

    // Newest items first
    items.sort(
      (item1, item2) =>
        Number(new Date(item2.createdAt)) - Number(new Date(item1.createdAt)),
    )

    // Remove duplicates
    items = items.filter(
      (item, index) =>
        items.findIndex(
          (other) =>
            this.sameItemTitle(item, other) && this.sameItemLabels(item, other),
        ) === index,
    )

    // Limit to 20 results
    items = items.slice(0, 20)

    return items
  }

  private sameItemTitle(item: ListItemEntity, other: ListItemEntity): boolean {
    return item.title.toLowerCase() === other.title.toLowerCase()
  }

  private sameItemLabels(item: ListItemEntity, other: ListItemEntity): boolean {
    return (
      item.labels.length === other.labels.length &&
      item.labels.every((label, index) => label === other.labels[index])
    )
  }

  async setTitle(id: string, title: string): Promise<void> {
    await this.repository.setTitle(id, title)
  }

  listLabels(): string[] {
    return this.repository.listLabels()
  }

  async setLabels(id: string, labels: string[]): Promise<void> {
    const trimmedLabels = labels.map((label) => label.trim()).filter(Boolean)

    await this.repository.setLabels(id, trimmedLabels)
  }

  async finish(id: string): Promise<void> {
    await this.repository.finish(id)
  }
}
