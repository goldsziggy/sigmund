import { ChatGPTAPI } from "chatgpt"
// import loginData from '../mock/sessions.js'

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0"
interface GPTBrowserUser {
  email: string
  password: string
  isGoogleLogin: boolean
  clearanceToken: string
  sessionToken: string
}

interface ResultObj {
  conversationId: string
  messageId: string
  response: string
}

let sessions = []
let currentUser = 0

// const sessions = loginData;
export const initializeAccounts = async () => {
  console.log("initializing accounts")
  // sessions = loginData

  const users: GPTBrowserUser[] = []
  sessions = await Promise.all(
    users.map(
      ({ email, password, isGoogleLogin, sessionToken, clearanceToken }: GPTBrowserUser) => {
        return new Promise((resolve, reject) => {
          console.log("Intializing account", email, isGoogleLogin)
          const api = new ChatGPTAPI({
            sessionToken,
            clearanceToken,
            userAgent,
          })

          api.initSession().then(() => {
            resolve({ api })
          })
        })
      }
    )
  )
  console.log("Initialized accounts")
  console.log(sessions)
}

export const sendMessageToSession = (message, opts): Promise<ResultObj> => {
  currentUser += 1
  console.log({ currentUser, len: sessions.length, actual: currentUser % sessions.length })
  return sessions[currentUser % sessions.length].api.sendMessage(message, opts)
}
