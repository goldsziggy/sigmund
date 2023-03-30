import { ChatGPTAPI } from "chatgpt"
import AWS from "aws-sdk"
import getErrorMessage from "../utils/error-message.js"

const Polly = new AWS.Polly({
  signatureVersion: "v4",
  region: process.env.AWS_DEFAULT_REGION,
})

const systemMessage =
  "You are ChatGPT, a large language model trained by OpenAI. You are taking on the task of assistanting humanity by taking the role of friendly psychiatrist. Please respond in friendly conversational manner as though you were talking to the human.  You will go by the name of Sigmund"

function getVoice(message) {
  const params = {
    Text: message,
    OutputFormat: "mp3",
    VoiceId: "Arthur",
    Engine: "neural",
    SampleRate: "24000",
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

function getMessage(message: string) {
  if (!message) {
    return "Please start by greeting the patient"
  }
  return `The human responds: "${message}"`
}

export default async function postChat(req, res, next) {
  try {
    const { msg, parentMessageId } = req.body
    console.log("Request Recieved")

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
    const { text: response } = conversation

    // response is a markdown-formatted string
    console.log(response)

    const audio = await getVoice(response)

    return res.send({
      conversationId: "abc", // legacy value -- may not need anymore?
      response,
      parentMessageId: conversation.id,
      audio: (audio as Buffer).toString("base64"),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({ err: getErrorMessage(e) })
  }
}

// module.exports = GetChat
