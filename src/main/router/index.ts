import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { Context } from './context'
import { yyLobby } from '..'
import { observable } from '@trpc/server/observable'
import { register } from 'module'
const t = initTRPC.context<Context>().create({
  isServer: true
})

export const appRouter = t.router({
  greeting: t.procedure
    .input(
      z.object({
        name: z.string()
      })
    )
    .query(({ input }) => {
      return `Helo ${input.name}`
    }),
  getConnection: t.procedure.query(() => {
    return yyLobby.getConnectionStatus()
  }),
  welcome: t.procedure.query(() => {
    return yyLobby.welcomeMessage
  }),
  login: t.procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .mutation(({ input }) => {
      yyLobby.login(input.username, input.password)
      return
    }),
  register: t.procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .mutation(({ input }) => {
      yyLobby.register(input.username, input.password)
    }),
  getLoginCode: t.procedure.query(() => {
    return yyLobby.loginResultCode
  })
})

export type AppRouter = typeof appRouter
