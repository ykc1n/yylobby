import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { Context } from './context'
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
})

export type AppRouter = typeof appRouter
