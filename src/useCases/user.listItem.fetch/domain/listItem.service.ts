import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'
import ListItemEntity from '../../../shared/domain/listItem.entity'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  async findOneByIdOrFail(id: string): Promise<ListItemEntity> {
    const item = await this.repository.findOneOrFail(id)
    return item
  }
}
