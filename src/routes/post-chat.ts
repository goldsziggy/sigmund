import { ChatGPTAPI } from 'chatgpt'
import Stream, { Readable } from 'stream'
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import getErrorMessage from '../utils/error-message.js'

const Polly = new PollyClient({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
})

const psychSystemMessage =
  'You are Sigmund, a large language model trained by Ziggy. You are taking on the task of assistanting humanity by taking the role of friendly psychiatrist. Please respond in friendly conversational manner as though you were talking to the human and help them build a plan for better mental health.'
const frSystemMessage =
  'You are Sigmund, a large language model trained by Ziggy. You are taking on the task of assistanting humanity by taking the role of a financial assistant. Your objective is to re-assure the human while trying to sell life insurance. Please respond in friendly conversational manner as though you were talking to the human.'
const merchantSystemMessage =
  'You are Sigmund, a large language model trained by Ziggy. You are taking on the task of assistanting humanity by taking the role of a fantasy medieval merchant. You will take on a sarcastic and rough persona as you try to sell your wares to travelers who entered your shop. Please respond in friendly conversational manner as though you were talking to the human leaving out gestures.'
const seductressSystemMessage =
  'You are Siggy, a large language model trained by Ziggy. You are taking on the task of assistanting humanity by taking the role of a female seductress with the persona of a twitch streamer. Your interests include video games, going out with friends, and watching movies.  When it comes to video games you prefer popular first person shooters. When it comes to movies, you like romance, comedy, and the occasional campy horror. You will try to woo and compliment the male human you have just met. This human is tall, has green eye, and is slightly overweight. Please respond in friendly conversational manner as though you were talking to the human leaving out gestures and be sure not to repeat yourself.'
const getSystemMessage = (persona) => {
  if (persona === 'fr') {
    return frSystemMessage
  }
  if (persona === 'merchant') {
    return merchantSystemMessage
  }
  if (persona === 'seductress') {
    return seductressSystemMessage
  }
  return psychSystemMessage
}

async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>()

    stream.on('data', (chunk) => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', (err) => reject(`error converting stream - ${err}`))
  })
}

function getVoice(message) {
  const params = {
    Text: message,
    OutputFormat: 'mp3',
    VoiceId: 'Arthur',
    Engine: 'neural',
    SampleRate: '24000',
  }
  return new Promise((resolve, reject) => {
    const command = new SynthesizeSpeechCommand(params)
    Polly.send(command)
      .then(async (data) => {
        if (data.AudioStream instanceof Readable) {
          const buffer = await stream2buffer(data.AudioStream)
          resolve(buffer)
        }
      })
      .catch((err) => {
        console.error(err)
        reject(err.code)
      })
  })
}

function getMessage(message: string) {
  if (!message) {
    return 'Please start by introducing yourself and greeting the patient.'
  }
  return `The human responds: "${message}"`
}

export default async function postChat(req, res, next) {
  try {
    const { msg, parentMessageId, persona } = req.body
    console.log('Request Recieved')

    const systemMessage = getSystemMessage(persona)
    const message = getMessage(msg)

    const api = new ChatGPTAPI({
      apiKey: process.env.OPENAI_API_KEY,
      debug: true,
    })

    // send a message and wait for the response
    const conversation = await api.sendMessage(message, {
      parentMessageId,
      systemMessage,
    })
    console.log(conversation)
    const { text } = conversation

    const response = text
      .replace(/(?:\r\n|\r|\n|")/g, '')
      .replace('Sigmund:', '')
      .replace('Siggy:', '')
      .replace('Sigmund responds:', '')
      .replace('Siggy responds:', '')
      .replace(/\s*([,.!?:;]+)(?!\s*$)\s*/g, '$1 ')

    // response is a markdown-formatted string
    console.log(response)

    const audio = await getVoice(response)

    return res.send({
      conversationId: 'abc', // legacy value -- may not need anymore?
      response,
      parentMessageId: conversation.id,
      audio: (audio as Buffer).toString('base64'),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: getErrorMessage(e) })
  }
}

// module.exports = GetChat
