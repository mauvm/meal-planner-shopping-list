import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'

@singleton()
export default class ShoppingListItemRepository {
  createUUID(): string {
    return uuid()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: { id: string; title: string }): Promise<void> {
    // @todo Implement
  }
}
