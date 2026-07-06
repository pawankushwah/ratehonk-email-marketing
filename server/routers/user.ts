import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const userRouter = router({

})

export type UserRouter = typeof userRouter;