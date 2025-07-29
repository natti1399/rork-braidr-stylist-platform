import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

/**
 * Allowed file types for different upload categories
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Generate unique filename
 */
export const generateFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  
  return `${name}_${timestamp}_${uuid}${ext}`;
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: Express.Multer.File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: Express.Multer.File,
  maxSizeInMB: number
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Create multer configuration for image uploads
 */
export const createImageUploadConfig = () => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.upload.maxImageSize * 1024 * 1024, // Convert MB to bytes
      files: config.upload.maxFiles
    },
    fileFilter: (req, file, cb) => {
      if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
        return cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400));
      }
      cb(null, true);
    }
  });
};

/**
 * Create multer configuration for document uploads
 */
export const createDocumentUploadConfig = () => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.upload.maxDocumentSize * 1024 * 1024, // Convert MB to bytes
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (!validateFileType(file, ALLOWED_DOCUMENT_TYPES)) {
        return cb(new AppError('Invalid file type. Only PDF and Word documents are allowed.', 400));
      }
      cb(null, true);
    }
  });
};

/**
 * Get file extension from mimetype
 */
export const getFileExtension = (mimetype: string): string => {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
  };
  
  return extensions[mimetype] || '';
};

/**
 * Create file path for Supabase storage
 */
export const createStoragePath = (
  folder: string,
  userId: string,
  filename: string
): string => {
  return `${folder}/${userId}/${filename}`;
};

/**
 * Validate image dimensions (if needed)
 */
export const validateImageDimensions = (
  width: number,
  height: number,
  maxWidth: number = 2048,
  maxHeight: number = 2048
): boolean => {
  return width <= maxWidth && height <= maxHeight;
};

/**
 * Generate thumbnail filename
 */
export const generateThumbnailName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}_thumb${ext}`;
};

/**
 * File upload categories
 */
export enum FileCategory {
  PROFILE_PICTURE = 'profile-pictures',
  SERVICE_IMAGES = 'service-images',
  PORTFOLIO_IMAGES = 'portfolio-images',
  DOCUMENTS = 'documents',
  CHAT_ATTACHMENTS = 'chat-attachments'
}

/**
 * Get allowed file types for category
 */
export const getAllowedTypesForCategory = (category: FileCategory): string[] => {
  switch (category) {
    case FileCategory.PROFILE_PICTURE:
    case FileCategory.SERVICE_IMAGES:
    case FileCategory.PORTFOLIO_IMAGES:
    case FileCategory.CHAT_ATTACHMENTS:
      return ALLOWED_IMAGE_TYPES;
    case FileCategory.DOCUMENTS:
      return ALLOWED_DOCUMENT_TYPES;
    default:
      return [];
  }
};

/**
 * Get max file size for category (in MB)
 */
export const getMaxSizeForCategory = (category: FileCategory): number => {
  switch (category) {
    case FileCategory.PROFILE_PICTURE:
      return 2; // 2MB
    case FileCategory.SERVICE_IMAGES:
    case FileCategory.PORTFOLIO_IMAGES:
      return 5; // 5MB
    case FileCategory.CHAT_ATTACHMENTS:
      return 3; // 3MB
    case FileCategory.DOCUMENTS:
      return 10; // 10MB
    default:
      return 1; // 1MB default
  }
};