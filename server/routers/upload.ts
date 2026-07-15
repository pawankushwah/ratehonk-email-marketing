import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import fs from 'fs';
import path from 'path';
import { getSubfolder } from '../utils/uploadHandler';

export const uploadRouter = router({
  uploadImage: protectedProcedure
    .input(z.object({
      base64Data: z.string(),
      fileName: z.string(),
      uploadType: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const { base64Data, fileName, uploadType } = input;
        const subfolder = getSubfolder(uploadType);
        
        // Remove the data URL prefix if present (e.g. data:image/jpeg;base64,)
        const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Content, 'base64');
        
        const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
        const destPath = path.join(UPLOAD_DIR, subfolder);
        
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(fileName).toLowerCase() || '.jpg';
        const finalFileName = uploadType + '-' + uniqueSuffix + ext;
        const filePath = path.join(destPath, finalFileName);
        
        fs.writeFileSync(filePath, buffer);
        
        const publicUrl = `/uploads/${subfolder}/${finalFileName}`;
        
        return { success: true, url: publicUrl, filename: finalFileName };
      } catch (err: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Image upload failed' });
      }
    })
});

export type UploadRouter = typeof uploadRouter;
