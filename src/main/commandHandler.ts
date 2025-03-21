export class replyHandler {
  webContents: Electron.WebContents
  name: string
  commands: Map<string, <T>(T) => void>
  // commands: Map<string, any>
  constructor(webContents: Electron.WebContents) {
    console.log('Constructeur')
    this.name = 'Helo'
    this.webContents = webContents
    //  this.commands = new Map([['Welcome', this.handleWelcome]])
  }

  handleCommands(commandName, data): void {
    // const command =
    //   this.commands.get(commandName) ?? ((): void => console.log('Command Not Available'))
    // command(data)
    switch (commandName) {
      case 'Welcome':
        this.handleWelcome(data)
        break
      case 'Say':
        this.handleSay(data)
        break
      case 'LoginResponse':
        this.handleLoginResponse(data)
        break
      default: {
        console.log('default')
        const out = {
          command: commandName,
          data: JSON.stringify(data)
        }
        try {
          this.webContents.send('idkCommand', out)
        } catch (e) {
          console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ERROR ON ${commandName} `)
          console.log(e)
          console.log(data)
        }
      }
      //break
    }
  }

  handleLoginResponse(JSONdata): void {
    const data = JSON.parse(JSONdata)
    console.log(data)
  }

  handleSay(JSONdata): void {
    const data = JSON.parse(JSONdata)
    this.webContents.send('Say', data)
  }

  handleWelcome(JSONdata): void {
    const data = JSON.parse(JSONdata)
    this.webContents.send('Welcome', data)
    //console.log('op?')
  }
}
