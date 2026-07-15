import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Securely store files inside public/uploads so Next.js can serve them directly.
// The public directory is served statically, and execution is blocked by the server container/setup usually.
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure base upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Map fieldnames to subfolders (categorization as requested)
export const getSubfolder = (fieldname: string) => {
  switch (fieldname) {
    case 'brandLogo':
      return 'brand-logos';
    case 'campaignImage':
      return 'campaign-images';
    case 'profilePicture':
      return 'profile-pictures';
    case 'businessBanner':
      return 'business-banners';
    default:
      return 'misc';
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = getSubfolder(file.fieldname);
    const destPath = path.join(UPLOAD_DIR, subfolder);
    
    // Ensure the categorized subfolder exists
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Generate a secure, random filename avoiding collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for security - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG files are allowed.'));
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
