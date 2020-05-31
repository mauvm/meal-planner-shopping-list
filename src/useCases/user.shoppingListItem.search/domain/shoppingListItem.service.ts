import { singleton } from 'tsyringe'
import ShoppingListItemRepository from '../infra/shoppingListItem.repository'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'

@singleton()
export default class ShoppingListItemService {
  constructor(private repository: ShoppingListItemRepository) {}

  searchItems(query: string): ShoppingListItemEntity[] {
    return this.repository.searchItems(query)
  }
}
