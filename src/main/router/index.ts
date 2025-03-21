import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { Context } from './context'
import { yyLobby } from '..'
import { observable } from '@trpc/server/observable'
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
  })
})

export type AppRouter = typeof appRouter
