//sample express app
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import express from 'express'
import bodyParser from 'body-parser'
import getChat from './routes/get-chat.mjs'
import getChatDebug from './routes/get-chat-debug.mjs'

// const express = require("express")
// const getChat = require("./routes/get-chat")

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

const api = express.Router()
api.post('/chat', getChat)
api.post('/chat-debug', getChatDebug)

app.use('/api', api)

app.listen(PORT, () => {
  console.log(`Sigmund app listening on port ${PORT}`)
})
