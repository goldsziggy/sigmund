import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const audio = require('../mock/audio.json')

export default async function postMock(req, res, next) {
  try {
    const { msg, conversationId, parentMessageId } = req.body
    const conversation = { conversationId: 'abc123', parentMessageId: 'xyz321' }
    return res.json({
      audio,
      response: "Good morning, it's my pleasure to meet you. How can I help you today?",
      conversationId: conversation.conversationId,
      parentMessageId: conversation.parentMessageId,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: e.message })
  }
}

// module.exports = GetChat
