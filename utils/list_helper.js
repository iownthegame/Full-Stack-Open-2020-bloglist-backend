const _ = require('lodash')
const { count } = require('../models/blog')

const dummy = (_blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => sum + item
  return blogs.map(blog => blog.likes).reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const reducer = (max, item) => (item.likes > max ? item.likes : max)
  const maxLike = blogs.reduce(reducer, blogs[0].likes)
  return blogs.find(blog => blog.likes === maxLike)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const countTable = _(blogs)
    .groupBy('author')
    .map((value, key) => ({ author: key, count: value.length }))
    .value()

  const maxBlog = Math.max(...countTable.map(item => item.count))

  return {
    author: countTable.find(item => item.count === maxBlog).author,
    blogs: maxBlog
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const countTable = _(blogs)
    .groupBy('author')
    .map((value, key) => ({ author: key, count: totalLikes(value) }))
    .value()

  const maxLike = Math.max(...countTable.map(item => item.count))

  return {
    author: countTable.find(item => item.count === maxLike).author,
    likes: maxLike
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
