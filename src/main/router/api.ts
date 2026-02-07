import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { on } from 'events'
import path from 'node:path'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  isServer: true
})

export const appRouter = t.router({
  // Get current state snapshot
  getState: t.procedure.query((opts) => {
    return opts.ctx.lobbyState.getState()
  }),

  // Single unified state stream - replaces all other subscriptions
  stateStream: t.procedure.subscription(async function* (opts) {
    const { lobbyState } = opts.ctx

    // Start listening BEFORE yielding initial state to avoid race condition
    const events = on(lobbyState, 'stateChange', { signal: opts.signal })

    // Yield initial state
    console.log('[stateStream] Yielding initial state')
    yield {
      type: 'full' as const,
      state: lobbyState.getState(),
      timestamp: Date.now()
    }

    // Then yield state updates as they arrive
    for await (const [update] of events) {
      console.log('[stateStream] State changed, yielding update')
      yield update
    }
  }),

  // Actions
  connect: t.procedure.mutation((opts) => {
    opts.ctx.lobbyInterface.connect()
    return { success: true }
  }),

  login: t.procedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async (opts) => {
      return await opts.ctx.lobbyInterface.login(opts.input.username, opts.input.password)
    }),

  joinChannel: t.procedure
    .input(z.object({ channelName: z.string(), password: z.string().optional() }))
    .mutation((opts) => {
      opts.ctx.lobbyInterface.joinChannel(opts.input.channelName, opts.input.password)
      return { success: true }
    }),

  sendMessage: t.procedure
    .input(z.object({ target: z.string(), text: z.string() }))
    .mutation((opts) => {
      opts.ctx.lobbyInterface.sendMessage(opts.input.target, opts.input.text)
      return { success: true }
    }),

  setActiveChannel: t.procedure
    .input(z.object({ channelName: z.string() }))
    .mutation((opts) => {
      opts.ctx.lobbyInterface.setActiveChannel(opts.input.channelName)
      return { success: true }
    }),

  // Replay endpoints (unchanged)
  getReplays: t.procedure
    .input(z.object({ game: z.enum(['zerok', 'bar']) }))
    .query(async (opts) => {
      try {
        opts.ctx.replayManager.setGame(opts.input.game)
        opts.ctx.zk_launcher.setGame(opts.input.game)
        const replays = await opts.ctx.replayManager.getCurrentPage()
        return { data: replays }
      } catch (error) {
        console.error('Error in replays:', error)
        throw error
      }
    }),

  openReplay: t.procedure
    .input(z.object({ filename: z.string() }))
    .mutation(async (opts) => {
      try {
        const replayPath = opts.ctx.replayManager.getBaseReplayPath()
        const fullPath = path.join(replayPath, opts.input.filename)
        await opts.ctx.zk_launcher.start_replay(fullPath)
      } catch (error) {
        console.error('Error in openReplay:', error)
        throw error
      }
    }),

  // Settings endpoints
  getSettings: t.procedure.query((opts) => {
    return opts.ctx.settingsManager.getSettings()
  }),

  setZeroKDirectory: t.procedure
    .input(z.object({ directory: z.string() }))
    .mutation((opts) => {
      opts.ctx.settingsManager.setZeroKDirectory(opts.input.directory)
      // Refresh replay manager with new path
      opts.ctx.replayManager.refreshPaths()
      return { success: true }
    }),

  getReplayDirectories: t.procedure.query((opts) => {
    return opts.ctx.settingsManager.getReplayDirectories()
  }),

  addReplayDirectory: t.procedure
    .input(z.object({ directory: z.string() }))
    .mutation((opts) => {
      opts.ctx.settingsManager.addReplayDirectory(opts.input.directory)
      opts.ctx.replayManager.refreshPaths()
      return { success: true }
    }),

  removeReplayDirectory: t.procedure
    .input(z.object({ directory: z.string() }))
    .mutation((opts) => {
      opts.ctx.settingsManager.removeReplayDirectory(opts.input.directory)
      opts.ctx.replayManager.refreshPaths()
      return { success: true }
    }),
  testDownload: t.procedure.mutation(async (opts) => {
    opts.ctx.zerokDownloader.testDownload()
    return { success: true }
  }),

  // Browse for directory (opens native dialog)
  browseForDirectory: t.procedure.mutation(async () => {
    const { dialog } = await import('electron')
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, path: null }
    }
    return { canceled: false, path: result.filePaths[0] }
  })
})

export type AppRouter = typeof appRouter
