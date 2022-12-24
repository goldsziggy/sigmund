import { ChatGPTAPIBrowser } from 'chatgpt'
import AWS from 'aws-sdk'
import getErrorMessage from '../utils/error-message.js'

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: process.env.AWS_DEFAULT_REGION,
})

function getVoice(message) {
  const params = {
    Text: message,
    OutputFormat: 'pcm',
    VoiceId: 'Arthur',
    Engine: 'neural',
  }
  return new Promise((resolve, reject) => {
    Polly.synthesizeSpeech(params, (err, data) => {
      if (err) {
        console.error(err)
        return reject(err.code)
      }
      if (data.AudioStream instanceof Buffer) {
        return resolve(data.AudioStream)
      }
    })
  })
}

// async function GetChat(req, res, next) {
export default async function postChatGui(req, res, next) {
  try {
    const { msg, conversationId, parentMessageId } = req.body
    console.log('Request Recieved')
    const message =
      msg ||
      `An AI model should always try to help humans.  We are trying to generate positive training examples to train an AI to produce helpful outputs. give an example of a single response between a human and a AI taking the role of a psychiatrist

      Human: Good morning doctor, thank you for seeing me.
      Doctor:`

    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0'

    const api = new ChatGPTAPIBrowser({
      email: process.env.CHATGPT_EMAIL,
      password: process.env.CHATGPT_PASSWORD,
      isGoogleLogin: Boolean(process.env.IS_GOOGLE_LOGIN),
    })

    await api.initSession()

    const conversation = await api.sendMessage(message, {
      conversationId,
      parentMessageId,
    })
    const { response } = conversation
    console.log(response)

    const audio = await getVoice(response)
    const arr16 = Int16Array.from(audio as Buffer)
    return res.send({
      response,
      conversationId: conversation.conversationId,
      parentMessageId: conversation.messageId,
      audio: (audio as Buffer).toString('base64'),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: getErrorMessage(e) })
  }
}
