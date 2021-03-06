const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    expect(titles).toContain(
      'Blog title 1'
    )
  })

  test('id is defined in the returned blog', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  let token

  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    const result = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'password',
      })

    token = result.body.token
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Blog title new',
      author: 'Author new',
      url: 'https://blog.new',
      likes: 123
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'Blog title new'
    )
  })

  test('a blog with undefined like will set to 0', async () => {
    const newBlog = {
      title: 'Blog title new',
      author: 'Author new',
      url: 'https://blog.new'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'Blog title new'
    )

    expect(blogsAtEnd[blogsAtEnd.length-1].likes).toBe(0)
  })

  test('blog without title or url is not added', async () => {
    const newBlogWithoutTitle = {
      author: 'Author new',
      url: 'https://blog.new'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlogWithoutTitle)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const newBlogWithoutUrl = {
      title: 'Blog title new',
      author: 'Author new'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlogWithoutUrl)
      .expect(400)

    const blogsAtEndAgain = await helper.blogsInDb()
    expect(blogsAtEndAgain).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without token is not added', async () => {
    const newBlog = {
      title: 'Blog title new',
      author: 'Author new',
      url: 'https://blog.new',
      likes: 123
    }

    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(result.body.error).toContain('invalid token')
  })
})

describe('deletion of a blog', () => {
  let token

  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'root', passwordHash })
    const savedUser = await user.save()

    const result = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'password',
      })

    token = result.body.token

    const blogs = await Blog.find({})
    const promiseArray = blogs.map(blog => {
      blog.user = savedUser._id
      blog.save()
    })
    await Promise.all(promiseArray)
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating of a blog', () => {
  test('succeeds with modification if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    blogToUpdate.likes = 10000

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const blog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    expect(blog.likes).toBe(10000)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
