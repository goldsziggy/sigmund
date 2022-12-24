//sample express app
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import express from 'express'
import bodyParser from 'body-parser'
import postChat from './routes/post-chat.js'
import postChatPolly from './routes/post-chat-polly.js'
import postMock from './routes/post-mock.js'
import postChatGUI from './routes/post-chat-gui.js'
import postChatSession from './routes/post-chat-session.js'
import { initializeAccounts } from './utils/chatgpt.js'

initializeAccounts()

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

const api = express.Router()
api.post('/chat', postChat)
api.post('/chat-polly', postChatPolly)
api.post('/chat-session', postChatSession)
api.post('/mock', postMock)
api.post('/chat-gui', postChatGUI)

app.use('/api', api)

app.listen(PORT, () => {
  console.log(`Sigmund app listening on port ${PORT}`)
})
