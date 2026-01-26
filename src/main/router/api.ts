import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { Context } from './context'
import { on } from 'events'
import  * as Commands from '../commands'
import fs from 'node:fs'
import path from 'node:path'
// import { lobbyInterface } from '../index'
const t = initTRPC.context<Context>().create({
  isServer: true
})



export const appRouter = t.router({


  greeting: t.procedure
.input(
  z.object({
    name:z.string()
  })
)
.query(({input}) => {
  console.log("bro")

  return `omg omg ${input.name}`
}),

  login: t.procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .mutation((opts) => {
      const input = opts.input
      const lobbyInterface = opts.ctx.lobbyInterface
      console.log("logging in")
      console.log(lobbyInterface)
      
      lobbyInterface.login(input.username, input.password)
      return
    }),

  register: t.procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .mutation((opts) => {
      opts.ctx.lobbyInterface.login(opts.input.username, opts.input.password)
     // lobbyInterface.register(input.username, input.password)
      return
    }),

    // welcomeStream: t.procedure
    // .subscription(async function* (opts){
    //   console.log("listening and learning")
    //   if(opts.ctx.lobbyInterface.lobby.welcomeMessage != null){
    //     console.log("already exists!~")
    //     return opts.ctx.lobbyInterface.lobby.welcomeMessage as object
    //   }
    //   const stream = opts.ctx.lobbyInterface.emitter
    //   for await (const [data] of on(stream,"Welcome", {signal:opts.signal})){
    //   yield data as object;
    //   }
    // }),
    getLobby:t.procedure
    .query((opts)=>{
      console.log("getting lobby")
      //console.log(opts.ctx.lobbyInterface.lobby)
      return opts.ctx.lobbyInterface.lobby
    }),

    lobbyUpdateStream: t.procedure
    .subscription( async function* (opts){
      console.log("erm")
      const stream = opts.ctx.lobbyInterface.clientEvents
      for await (const [data] of on(stream, "lobbyUpdate", {signal:opts.signal})){
        console.log("sending data!")
      console.log(data)
      yield data as object;
      }

    }),

    listenerStream: t.procedure
    .input(z.object({
      command: z.string()
    }))
    .subscription(async function* (opts){
      console.log("waaaa")
      const stream = opts.ctx.lobbyInterface.emitter
      for await (const [data] of on(stream, opts.input.command, {signal:opts.signal})){
      console.log(data)
      yield data as object;
      }

    }),
    getReplays:t.procedure
    .input(z.object({
      game: z.enum(['zerok', 'bar'])
    }))
    .query((async (opts)=>{
      console.log("helohelo")
      try{
      opts.ctx.replayManager.setGame(opts.input.game)
      opts.ctx.zk_launcher.setGame(opts.input.game)
      const replays = await opts.ctx.replayManager.getCurrentPage()
      
      return {data:replays}}
      catch(error){
        console.error("Error in replays:", error)
        throw error
      }
    })),
    openReplay:t.procedure
    .input(z.object({
      filename:z.string()
    }))
    .mutation(async (opts)=>{
      try {
        const replayPath = opts.ctx.replayManager.baseReplayPath
        console.log("testing waa - mutation called")
        console.log("replayPath:", replayPath)
        console.log("filename:", opts.input.filename)
        const fullPath = path.join(replayPath, opts.input.filename)
        console.log("fullPath:", fullPath)
        
        await opts.ctx.zk_launcher.start_replay(fullPath)
        console.log("start_replay completed")
      } catch (error) {
        console.error("Error in openReplay:", error)
        throw error
      }
    })
    

})

export type AppRouter = typeof appRouter
