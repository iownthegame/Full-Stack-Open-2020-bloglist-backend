const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Blog title 1',
    author: 'Author 1',
    url: 'https://blog.1',
    likes: 999
  },
  {
    title: 'Blog title 2',
    author: 'Author 2',
    url: 'https://blog.2',
    likes: 1
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, blogsInDb, usersInDb
}
