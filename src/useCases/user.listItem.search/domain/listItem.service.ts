import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'
import ListItemEntity from '../../../shared/domain/listItem.entity'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  searchItems(query: string): ListItemEntity[] {
    return this.repository.searchItems(query)
  }
}
