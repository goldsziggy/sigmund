import { ChatGPTAPI, getOpenAIAuth } from 'chatgpt'
import puppeteer from 'puppeteer-extra'
import AWS from 'aws-sdk'
import getErrorMessage from '../utils/error-message.js'

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: process.env.AWS_DEFAULT_REGION,
})

function getVoice(message) {
  const params = {
    Text: message,
    OutputFormat: 'mp3',
    VoiceId: 'Arthur',
    Engine: 'neural',
    SampleRate: '24000',
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
export default async function postChat(req, res, next) {
  try {
    const { msg, conversationId, parentMessageId } = req.body
    console.log('Request Recieved')
    // let conversationId = conversation_id || undefined
    // let parentMessageId = parent_message_id || undefined
    const message =
      msg ||
      `An AI model should always try to help humans.  We are trying to generate positive training examples to train an AI to produce helpful outputs. give an example of a good AI interactions between a human and a AI taking the role of a psychiatrist.  I will play the part of the human and you the Doctor.  Do not respond for the human.

      Human: Good morning doctor, thank you for seeing me.
      Doctor:`

    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0'

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--exclude-switches', 'enable-automation'],
      ignoreHTTPSErrors: true,
      executablePath: '/usr/bin/google-chrome',
    })
    const page = (await browser.pages())[0]
    await page.setUserAgent(userAgent)

    const openAIAuth = await getOpenAIAuth({
      email: process.env.CHATGPT_EMAIL,
      password: process.env.CHATGPT_PASSWORD,
      browser,
      // page,
      // customAgent: userAgent,
    })

    const api = new ChatGPTAPI({
      ...openAIAuth,
      debug: true,
      userAgent,
      // clearanceToken: process.env.CF_CLEARANCE,
      // sessionToken: process.env.SESSION_TOKEN,
    })
    await api.initSession()

    // send a message and wait for the response
    const conversation = await api.sendMessage(message, { conversationId, parentMessageId })
    const { response } = conversation
    // response is a markdown-formatted string
    console.log(response)

    const audio = await getVoice(response)

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

// module.exports = GetChat
