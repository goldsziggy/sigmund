import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import getErrorMessage from '../utils/error-message.js'
const audio = require('../mock/audio-pcm.json')
// const audio64 = require('../mock/audio-mp3.base64')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const audio64 = fs.readFileSync(path.resolve(__dirname + '/../mock/audio-mp3.base64'), 'utf-8')
// console.log(audio64)
export default async function postMock(req, res, next) {
  try {
    console.log('post-mock called!')
    const { msg, conversationId, parentMessageId } = req.body
    const conversation = { conversationId: 'abc123', parentMessageId: 'xyz321' }

    return res.json({
      audio: audio64,
      audioBase64: audio64,
      response: "Good morning, it's my pleasure to meet you. How can I help you today?",
      conversationId: conversation.conversationId,
      parentMessageId: conversation.parentMessageId,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: getErrorMessage(e) })
  }
}

// module.exports = GetChat
