import { replyHandler } from './commandHandler'

export default function dataHandler(commandHandler, dataBuffer, e): string {
  console.log('-----------HEADER------------------')
  const newData = JSON.stringify(e.toString())
  let res
  const newDataSize = newData.length
  const tempBuffer = dataBuffer + e.toString()

  const endChar = newData.substring(newDataSize - 3, newDataSize - 1)

  console.log(`END CHARACTER: ${endChar}`)
  const isComplete = endChar === '\\n' ? true : false
  console.log(`is complete: ${isComplete}`)
  //console.log
  console.log('----------------------------------')

  //console.log(newData)
  const commands = //JSON.stringify(
    tempBuffer
      .trimEnd()
      //.toString()
      // )
      .split('\n')
  //.map((e) => `COMMAND  \n${e} \n ENDCOMMAND`)

  /* .forEach((e) => {
                  console.log(' command:')
                  console.log(e)
                })
                */

  if (!isComplete) {
    const incompleteCommand = commands.splice(-1)
    console.log(e.toString())
    console.log('!!!!!!!!!!!!!!!!!!!INCOMPLETE COMMAND: ')
    console.log(incompleteCommand)
    console.log('!!!!!!!!!!!!!!!!!!!END IN PROGRESS COMMAND')

    res = dataBuffer + incompleteCommand //commands.splice(-1)
    //return
  } else {
    res = ''
  }

  //console.log(commands)
  //console.log('complete!')
  console.log('COMMANDS: \n')
  commands.forEach((commandString) => {
    //console.log(commandString)
    const seperator = commandString.indexOf(' ')
    const [command, data] = [
      commandString.substring(0, seperator),
      commandString.substring(seperator)
    ]
    console.log(`NAME: ${command}`)

    //console.log(`DATA: ${data}`)

    commandHandler.handleCommands(command, data)
  })
  console.log('END OF COMMANDS')
  //const data = e.toString().split(' ')
  //const [incomingCommand, ...incomingData] = data
  // replyHandler(
  //   mainWindow.webContents,
  //   incomingCommand,
  //   incomingData.reduce((p, c) => {
  //     return p + ' ' + c
  //   })
  // )
  return res
}
