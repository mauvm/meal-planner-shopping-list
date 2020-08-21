import { Server } from 'http'
import { container } from 'tsyringe'
import { expect } from 'chai'
import request from 'supertest'
import HttpStatus from 'http-status-codes'
import { createApp, cleanUpApp } from '../../app'
import ConfigService from '../../domain/config.service'
import EventStore from '../../infra/event.store'
import EventMockStore from '../../infra/event.store.mock'
import ListInviteService from '../../domain/list/listInvite.service'
import ListEntity from '../../domain/list/list.entity'
import { plainToClass } from 'class-transformer'
import ListStore from '../../infra/list/list.store'
import ListCreated from '../../domain/list/listCreated.event'

describe('ListInviteV1Controller', () => {
  let server: Server
  let config: ConfigService
  let eventStore: EventStore

  beforeEach(async () => {
    container.clearInstances()

    config = container.resolve(ConfigService)
    config.set('logger.level', 'warn')
    config.set('list.inviteCode.secretKey', 'abcd')

    eventStore = container.resolve(EventMockStore)
    container.registerInstance(EventStore, eventStore)

    const app = await createApp()
    server = app.listen()
  })

  afterEach(async () => {
    await cleanUpApp(server)
  })

  describe('should have a POST /v1/lists/invite endpoint that', () => {
    const userId = '1234567890'
    const validJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    it('returns a 401 Unauthorized on missing JWT', async () => {
      // Execute
      const response = await request(server)
        .post('/v1/lists/invite')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'Missing Bearer JWT in Authorization header',
      )
    })

    it('returns a 401 Unauthorized on invalid JWT', async () => {
      // Data
      const invalidJwt = 'invalid.invalid.invalid'

      // Execute
      const response = await request(server)
        .post('/v1/lists/invite')
        .set('Authorization', `Bearer ${invalidJwt}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'Invalid JWT in Authorization header',
      )
    })

    it('returns a 400 Bad Request on missing invite code', async () => {
      // Execute
      const response = await request(server)
        .post('/v1/lists/invite')
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/)

      // Test
      const constraint = response.body?.errors?.[0]
      expect(constraint.property).to.equal('code')
      expect(constraint.constraints).to.deep.equal({
        isNotEmpty: 'code should not be empty',
        isString: 'code must be a string',
        maxLength: 'code must be shorter than or equal to 512 characters',
      })
    })

    it('returns a 400 Bad Request on non-configured secret key', async () => {
      // Dependencies
      config.set('list.inviteCode.secretKey', '')

      // Execute
      const response = await request(server)
        .post('/v1/lists/invite')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ code: 'invalidcode' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'No secret key configured for creating list invite codes',
      )
    })

    it('returns a 400 Bad Request on invalid invite code', async () => {
      // Execute
      const response = await request(server)
        .post('/v1/lists/invite')
        .set('Authorization', `Bearer ${validJwt}`)
        .send({ code: 'test' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/)

      // Test
      expect(response.body?.message).to.equal(
        'Unable to parse JSON from invite code',
      )
    })

    describe('with ListInviteService', () => {
      let listInviteService: ListInviteService
      let listStore: ListStore

      let list: ListEntity

      beforeEach(() => {
        listInviteService = container.resolve(ListInviteService)
        listStore = container.resolve(ListStore)

        list = plainToClass(ListEntity, {
          id: 'abcd',
          title: 'Test list',
          owners: ['user1'],
        })
      })

      it('returns a 400 Bad Request on expired invite code', async () => {
        // Data
        const code = listInviteService.createInviteCode(list, 1)
        const createdEvent = new ListCreated('1', list.id, {
          title: list.title,
          owners: list.owners,
        })

        // Dependencies
        listStore.handleEvent(createdEvent)

        await new Promise((resolve) => setTimeout(resolve, 10)) // Ensure invite code expired

        // Execute
        const response = await request(server)
          .post('/v1/lists/invite')
          .set('Authorization', `Bearer ${validJwt}`)
          .send({
            code,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect('Content-Type', /json/)

        // Test
        expect(response.body?.message).to.equal('Invite code has expired')
        const aggregate = listStore.getAggregateById(list.id)
        expect(aggregate?.data?.owners).to.deep.equal(list.owners)
      })

      it('returns a 404 Not Found on non-existant list', async () => {
        // Data
        const code = listInviteService.createInviteCode(list, 1000)

        // Execute
        const response = await request(server)
          .post('/v1/lists/invite')
          .set('Authorization', `Bearer ${validJwt}`)
          .send({
            code,
          })
          .expect(HttpStatus.NOT_FOUND)
          .expect('Content-Type', /json/)

        // Test
        expect(response.body?.message).to.equal('No list found for ID "abcd"')
        const aggregate = listStore.getAggregateById(list.id)
        expect(aggregate).to.be.undefined
      })

      it('returns a 202 Accepted when user is already owner of list from invite code', async () => {
        // Data
        list.owners = [userId]
        const code = listInviteService.createInviteCode(list, 1000)
        const createdEvent = new ListCreated('1', list.id, {
          title: list.title,
          owners: list.owners,
        })

        // Dependencies
        listStore.handleEvent(createdEvent)

        // Execute
        const response = await request(server)
          .post('/v1/lists/invite')
          .set('Authorization', `Bearer ${validJwt}`)
          .send({
            code,
          })
          .expect(HttpStatus.ACCEPTED)
          .expect('Content-Type', /json/)

        // Test
        expect(response.body).to.deep.equal({})
        const aggregate = listStore.getAggregateById(list.id)
        expect(aggregate?.data?.owners).to.deep.equal([userId])
      })

      it('returns a 202 Accepted when user has been made owner of list from invite code', async () => {
        // Data
        const code = listInviteService.createInviteCode(list, 1000)
        const createdEvent = new ListCreated('1', list.id, {
          title: list.title,
          owners: list.owners,
        })

        // Dependencies
        listStore.handleEvent(createdEvent)

        // Execute
        const response = await request(server)
          .post('/v1/lists/invite')
          .set('Authorization', `Bearer ${validJwt}`)
          .send({
            code,
          })
          .expect(HttpStatus.ACCEPTED)
          .expect('Content-Type', /json/)

        // Test
        expect(response.body).to.deep.equal({})
        const aggregate = listStore.getAggregateById(list.id)
        expect(aggregate?.data?.owners).to.deep.equal(
          list.owners.concat([userId]),
        )
      })
    })
  })
})
