import fs from 'node:fs'
import path from 'node:path'

//ill just hardcode them for now and then think about them more later ahah

//i probably need some strict checking here so you cant break this by having broken configs
export class Settings{
    configsPath = 'C:/Users/Nick/Projects/yylobby/src/main/local/configs.txt'
    defaultConfigs = {
        ZeroKConfigs:{
        Username:'therxyy',
        ReplaysDirectory:'C:/Program Files (x86)/Steam/steamapps/common/Zero-K/demos',
        BaseDirectory:'C:/Program Files (x86)/Steam/steamapps/common/Zero-K',
        },
        BeyondAllReasonConfigs:{
        Username:'therxyy',
        ReplaysDirectory:'C:/Program Files/Beyond-All-Reason/data/demos',
        BaseDirectory:'C:/Program Files/Beyond-All-Reason/data'
        }
    }
    configs = this.defaultConfigs

    constructor(){
        if(!fs.existsSync(this.configsPath)){
            this.writeDefaultConfigs()
            return
        }
        try{ 
      this.configs = JSON.parse(fs.readFileSync(this.configsPath)
      .toString())
        } catch (err){ 
            console.log(err)
            this.writeDefaultConfigs()

        }
    
    }

    writeDefaultConfigs():void{
        const configs = JSON.stringify(this.defaultConfigs, null, 2)
        fs.writeFile(this.configsPath, configs, err => {
            if(err){
                console.log(err)
                return 
            }
            console.log("wrote configs!")
        })
    }

    saveConfigs():void{
        const configs = JSON.stringify(this.configs, null, 2)
        fs.writeFile(this.configsPath, configs, err => {
            if(err){
                console.log(err)
                return 
            }
            console.log("saved configs!")
        })
    }
}