const dummy = (_blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => sum + item
  return blogs.map(blog => blog.likes).reduce(reducer, 0)
}

module.exports = {
  dummy,
  totalLikes
}
