import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'
import ListItemEntity from './listItem.entity'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async create(data: { title: string }): Promise<string> {
    data.title = data.title.trim()

    return this.repository.create(data)
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
    return this.repository.searchItems(query)
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
