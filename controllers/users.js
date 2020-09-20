const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.password === undefined) {
    response.status(400).json({ error: '`password` is required.' })
  } else if (body.password.length < 3) {
    response.status(400).json({ error: `\`password\` (\`${body.password}\`) is shorter than the minimum allowed length (3).` })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter
