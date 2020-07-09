import { singleton } from 'tsyringe'
import ListItemEntity from './listItem.entity'
import UserEntity from '../user.entity'
import ListItemRepository from '../../infra/listItem/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async create(
    data: { listId: string; title: string },
    user: UserEntity,
  ): Promise<string> {
    const id = await this.repository.create(
      {
        listId: data.listId,
        title: data.title.trim(),
      },
      user,
    )

    return id
  }

  async findOneByIdOrFail(id: string): Promise<ListItemEntity> {
    const item = await this.repository.findOneOrFail(id)

    return item
  }

  async findAllUnfinished(listId: string): Promise<ListItemEntity[]> {
    const items = await this.repository.findAllUnfinished(listId)

    // Sort by creation datetime descending
    items.sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
    )

    return items
  }

  searchItems(listId: string, query: string): ListItemEntity[] {
    let items = this.repository.searchItems(listId, query)

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

  async setTitle(id: string, title: string, user: UserEntity): Promise<void> {
    await this.repository.setTitle(id, title, user)
  }

  fetchAllListLabels(listId: string): string[] {
    return this.repository.fetchAllListLabels(listId)
  }

  async setLabels(
    id: string,
    labels: string[],
    user: UserEntity,
  ): Promise<void> {
    const trimmedLabels = labels.map((label) => label.trim()).filter(Boolean)

    await this.repository.setLabels(id, trimmedLabels, user)
  }

  async finish(id: string, user: UserEntity): Promise<void> {
    await this.repository.finish(id, user)
  }
}
