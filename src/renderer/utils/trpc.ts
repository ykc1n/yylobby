import type { AppRouter } from '../../main/router'
import { createTRPCReact } from '@trpc/react-query'

export const trpcReact = createTRPCReact<AppRouter>()
