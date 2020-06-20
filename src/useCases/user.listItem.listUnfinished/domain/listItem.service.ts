import { singleton } from 'tsyringe'
import ListItemEntity from '../../../shared/domain/listItem.entity'
import ListItemRepository from '../infra/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async findAllUnfinished(): Promise<ListItemEntity[]> {
    const items = await this.repository.findAllUnfinished()

    // Sort by creation datetime descending
    items.sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
    )

    return items
  }
}
