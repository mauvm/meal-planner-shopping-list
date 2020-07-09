import { singleton } from 'tsyringe'
import { uuid } from 'uuidv4'
import { plainToClass } from 'class-transformer'
import ListStore from './list.store'
import ListEntity from '../../domain/list/list.entity'
import ListCreated from '../../domain/list/listCreated.event'
import UserEntity, { UserId } from '../../domain/user.entity'

@singleton()
export default class ListRepository {
  constructor(private listStore: ListStore) {}

  async create(
    data: { title: string; owners: UserId[] },
    user: UserEntity,
  ): Promise<string> {
    const aggregateId = uuid()
    const event = new ListCreated(null, aggregateId, data)

    // @todo Assert that aggregate ID is not in use

    await this.listStore.persistEvent(event, user)

    return aggregateId
  }

  async findOneOrFail(aggregateId: string): Promise<ListEntity> {
    this.listStore.assertObservedEvent(aggregateId, ListCreated)

    const aggregate = this.listStore.getAggregateById(aggregateId)
    const item = plainToClass(ListEntity, aggregate.data)

    // @todo Validate instance

    return item
  }

  async findAllForUser(user: UserEntity): Promise<ListEntity[]> {
    const aggregates = Array.from(this.listStore.getAggregates().values())

    return aggregates
      .map((aggregate) => plainToClass(ListEntity, aggregate.data))
      .filter((list) => list.hasOwner(user))
  }
}
