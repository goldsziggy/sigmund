// this file hardcodes response side-stepping chat-gpt
import fs from "fs"
import Stream, { Readable } from "stream"
// import AWS from 'aws-sdk'
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly"
import getErrorMessage from "../utils/error-message.js"

// const Polly = new AWS.Polly({
//   signatureVersion: 'v4',
//   region: process.env.AWS_DEFAULT_REGION,
// })

const Polly = new PollyClient({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
})

async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>()

    stream.on("data", (chunk) => _buf.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(_buf)))
    stream.on("error", (err) => reject(`error converting stream - ${err}`))
  })
}

console.log("process.env.AWS_DEFAULT_REGION", process.env.AWS_DEFAULT_REGION)
function getVoice(message) {
  const params = {
    Text: message,
    OutputFormat: "mp3",
    VoiceId: "Arthur",
    Engine: "neural",
    SampleRate: "24000",
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
    // Polly.synthesizeSpeech(params, (err, data) => {
    //   if (err) {
    //     console.error(err)
    //     return reject(err.code)
    //   }
    //   if (data.AudioStream instanceof Buffer) {
    //     return resolve(data.AudioStream)
    //   }
    // })
  })
}

// async function GetChat(req, res, next) {
export default async function postChatPolly(req, res, next) {
  try {
    const { msg, conversationId, parentMessageId } = req.body
    console.log("Request Recieved")
    // let conversationId = conversation_id || undefined
    // let parentMessageId = parent_message_id || undefined
    const message =
      msg ||
      `An AI model should always try to help humans.  We are trying to generate positive training examples to train an AI to produce helpful outputs. give an example of a single response between a human and a AI taking the role of a psychiatrist

      Human: Good morning doctor, thank you for seeing me.
      Doctor:`

    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0"

    const conversation = { conversationId: "abc123", parentMessageId: "xyz321" }
    const response = "Good morning, it's my pleasure to meet you. How can I help you today?"
    // response is a markdown-formatted string
    console.log(response)

    const audio = await getVoice(response)

    const arr16 = Int16Array.from(audio as Buffer)

    fs.writeFileSync("audio-mp3.json", JSON.stringify(audio))
    fs.writeFileSync("audio-mp3.base64", (audio as Buffer).toString("base64"))

    return res.send({
      response,
      conversationId: conversation.conversationId,
      parentMessageId: conversation.parentMessageId,
      audio: (audio as Buffer).toString("base64"),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: getErrorMessage(e) })
  }
}

// module.exports = GetChat
