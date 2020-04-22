import { singleton } from 'tsyringe'
import { plainToClass } from 'class-transformer'
import ShoppingListItemEntity from '../domain/shoppingListItem.entity'

@singleton()
export default class ShoppingListItemRepository {
  async findOne(id: string): Promise<ShoppingListItemEntity | undefined> {
    return plainToClass(ShoppingListItemEntity, {
      id,
      title: 'Vegetarisch gehakt',
    })
  }
}
