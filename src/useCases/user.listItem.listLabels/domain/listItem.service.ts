import { singleton } from 'tsyringe'
import ListItemRepository from '../infra/listItem.repository'

@singleton()
export default class ListItemService {
  constructor(private repository: ListItemRepository) {}

  listLabels(): string[] {
    return this.repository.listLabels()
  }
}
