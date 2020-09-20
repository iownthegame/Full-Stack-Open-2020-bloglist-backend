const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('addition of a new user', () => {

  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', passwordHash: '1234567890' })
    await user.save()
  })

  test('a valid user can be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Username',
      name: 'Name',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(n => n.username)
    expect(usernames).toContain('Username')
  })

  test('user without name can be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Username',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(n => n.username)
    expect(usernames).toContain('Username')
  })

  test('user without username is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Name',
      password: 'password'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain('`username` is required.')
  })

  test('user without password is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Username',
      name: 'Name'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain('`password` is required.')
  })

  test('user with invalid username is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Us',
      name: 'Name',
      password: 'password'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain('`username` (`Us`) is shorter than the minimum allowed length')
  })

  test('user with invalid password is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Username',
      name: 'Name',
      password: 'pa'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain('`password` (`pa`) is shorter than the minimum allowed length')
  })

  test('user with existing username is not added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Name',
      password: 'password'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    expect(result.body.error).toContain('`username` to be unique')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
