import net from 'net'
import { EventEmitter } from 'stream'



export default class ZerokConnection
{

  connected = false
  connection = new net.Socket()
  emitter = new EventEmitter()
  ZK_SERVER = {
    host: 'zero-k.info',
    port: 8200
  }
  ZK_DEV_SERVER = {
    host: 'test.zero-k.info',
    port: 8202
  }
  TEST_SERVER = {
    host: '127.0.0.1',
    port: 8888
  }


  //commandQueue = []
  dataBuffer = ''
  handleData(rawData):void {
    console.log('-----------HEADER------------------')
    const newData = JSON.stringify(rawData.toString())
    const newDataSize = newData.length
    const tempBuffer = this.dataBuffer + rawData.toString()
    const endChar = newData.substring(newDataSize - 3, newDataSize - 1)
    console.log(`END CHARACTER: ${endChar}`)
    const isComplete = endChar === '\\n' ? true : false
    console.log(`is complete: ${isComplete}`)
    //console.log
    //console.log('----------------------------------')
    const commands=tempBuffer.trimEnd().split('\n')
    
    if (!isComplete) {
      const incompleteCommand = commands.splice(-1)
      this.dataBuffer = this.dataBuffer + incompleteCommand 
    } else {
      this.dataBuffer = ''
    }
    console.log('COMMANDS: \n')
    commands.forEach((commandString) => {
      const seperator = commandString.indexOf(' ')
      const [command, data] = [
        commandString.substring(0, seperator),
        commandString.substring(seperator)
      ]
      console.log(`NAME: ${command}, DATA: ${data}`)
      this.emitter.emit(command, data)
      //this.emit(command, data)
    })
    console.log('~~~~~~~~~END OF COMMANDS~~~~~~~~~~~~')
}

connect_to_zk():void{
  console.log("test")
  if(this.connected){
    this.connection.destroy()
    this.connected = false
    console.log("Reconnecting. ")
  }
  this.connection.connect(this.ZK_SERVER)
  this.connection
      .setEncoding('utf-8')
      .on('connect', () => {
        console.log("yay")
        this.connected = true
      })
      .on('close', () => {
        console.log("uhh")
        this.connected = false
      })
      .on('data', (e) => {
      console.log("hmm")
      this.handleData(e)
    })
}
sendCommand(commandName,data):void{
  this.connection.write(`${commandName} ${JSON.stringify(data)} \n`)
}


}




