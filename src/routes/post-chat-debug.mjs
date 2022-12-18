// this file hardcodes response side-stepping chat-gpt
import { ChatGPTAPI, getOpenAIAuth } from 'chatgpt'
import puppeteer from 'puppeteer-extra'
import { v4 as uuidv4 } from 'uuid'
import delay from 'delay'
import fs from 'fs'
import AWS from 'aws-sdk'

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: process.env.AWS_DEFAULT_REGION,
})

function getVoice(message) {
  let params = {
    Text: message,
    OutputFormat: 'mp3',
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
export default async function postChatDebug(req, res, next) {
  try {
    const { msg, conversationId, parentMessageId } = req.body
    console.log('Request Recieved')
    // let conversationId = conversation_id || undefined
    // let parentMessageId = parent_message_id || undefined
    const message =
      msg ||
      `An AI model should always try to help humans.  We are trying to generate positive training examples to train an AI to produce helpful outputs. give an example of a single response between a human and a AI taking the role of a psychiatrist

      Human: Good morning doctor, thank you for seeing me.
      Doctor:`

    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0'

    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--exclude-switches', 'enable-automation'],
    //   ignoreHTTPSErrors: true,
    //   executablePath: '/usr/bin/google-chrome',
    // })
    // const page = (await browser.pages())[0]
    // await page.setUserAgent(userAgent)

    // const defaultUserAgent = await browser.userAgent()
    // const pages = await browser.pages()

    // const openAIAuth = await getOpenAIAuth({
    //   email: process.env.CHATGPT_EMAIL,
    //   password: process.env.CHATGPT_PASSWORD,
    //   browser,
    //   customAgent: userAgent,

    // })

    // const api = new ChatGPTAPI({
    //   // ...openAIAuth,
    //   debug: true,
    //   userAgent,
    //   clearanceToken: process.env.CF_CLEARANCE,
    //   sessionToken: process.env.SESSION_TOKEN,

    //   // cookies,
    // })
    // await api.ensureAuth()
    // const conversation = api.getConversation({ parentMessageId, conversationId })
    // await delay(1000)
    // send a message and wait for the response
    // const response = await conversation.sendMessage(message, { conversationId, parentMessageId })
    const conversation = { conversationId: 'abc123', parentMessageId: 'xyz321' }
    const response = "Good morning, it's my pleasure to meet you. How can I help you today?"
    // response is a markdown-formatted string
    console.log(response)

    const audio = await getVoice(response)

    return res.send({
      response,
      conversationId: conversation.conversationId,
      parentMessageId: conversation.parentMessageId,
      audio,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: e.message })
  }
}

// module.exports = GetChat
