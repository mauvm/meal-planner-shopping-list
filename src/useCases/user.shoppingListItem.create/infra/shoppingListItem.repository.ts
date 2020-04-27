import { singleton } from 'tsyringe'
import { plainToClass } from 'class-transformer'
import { uuid } from 'uuidv4'
import ShoppingListItemEntity from '../../../shared/domain/shoppingListItem.entity'
import temporaryDatabase from '../../../shared/infra/temporaryDatabase'

@singleton()
export default class ShoppingListItemRepository {
  async create(data: { title: string }): Promise<ShoppingListItemEntity> {
    const item = plainToClass(ShoppingListItemEntity, data)

    item.uuid = uuid()
    temporaryDatabase.shoppingListItems.set(item.uuid, item)

    return item
  }
}
