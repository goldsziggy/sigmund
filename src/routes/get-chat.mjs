import { ChatGPTAPI, getOpenAIAuth } from "chatgpt"

// async function GetChat(req, res, next) {
export default async function GetChat(req, res, next) {
  const { chat } = req.body

  const openAIAuth = await getOpenAIAuth({
    email: process.env.EMAIL,
    password: process.env.EMAIL,
  })

  const api = new ChatGPTAPI({ ...openAIAuth })
  await api.ensureAuth()

  // send a message and wait for the response
  const response = await api.sendMessage("Write a python version of bubble sort.")

  // response is a markdown-formatted string
  console.log(response)
  res.send(response)
}

// module.exports = GetChat
