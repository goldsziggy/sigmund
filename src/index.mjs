//sample express app
import express from "express"
import getChat from "./routes/get-chat.mjs"
// const express = require("express")
// const getChat = require("./routes/get-chat")

const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const api = express.Router()
api.get("/chat", getChat)

app.use("/api", api)

app.listen(PORT, () => {
  console.log(`Sigmund app listening on port ${PORT}`)
})
