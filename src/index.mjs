//sample express app
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import express from 'express'
import bodyParser from 'body-parser'
import postChat from './routes/post-chat.mjs'
import postChatDebug from './routes/post-chat-debug.mjs'
import postMock from './routes/post-mock.mjs'

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

const api = express.Router()
api.post('/chat', postChat)
api.post('/chat-debug', postChatDebug)
api.post('/mock', postMock)

app.use('/api', api)

app.listen(PORT, () => {
  console.log(`Sigmund app listening on port ${PORT}`)
})
