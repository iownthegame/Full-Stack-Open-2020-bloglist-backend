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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
