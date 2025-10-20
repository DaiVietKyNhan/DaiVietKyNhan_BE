import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

// Multer config cho hình ảnh
export const CloudinaryImageMulterConfig = {
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
      folder: 'vocabulary/images',
      resource_type: 'image',
      format: 'png',
      public_id: file.originalname.split('.')[0]
    })
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'), false)
    }
  },
  limits: {
    fileSize: undefined // Bỏ giới hạn kích thước file
  }
}

// Multer config cho audio
export const CloudinaryAudioMulterConfig = {
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
      folder: 'vocabulary/audio',
      resource_type: 'video', // Cloudinary treats audio as video
      format: 'mp3',
      public_id: file.originalname.split('.')[0]
    })
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file âm thanh'), false)
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}

// Multer config chung cho multiple files - sử dụng memory storage để xử lý
export const CloudinaryMultiMulterConfig = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh hoặc âm thanh'), false)
    }
  },
  limits: {
    fileSize: undefined, // Bỏ giới hạn kích thước file cho hình ảnh
    files: 2 // Tối đa 2 files
  }
}

// Multer config cho upload image với folder tùy chọn - không giới hạn kích thước, tối đa 10 files
export const CloudinaryImageUploadConfig = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Kiểm tra mimetype
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, WEBP, GIF)'), false)
    }
  },
  limits: {
    fileSize: undefined, // Bỏ giới hạn kích thước file
    files: 10 // Tối đa 10 files (phù hợp với maxCount: 10 trong controller)
  }
}

// Multer config linh hoạt cho tất cả các loại file - chỉ check basic validation
export const CloudinaryFlexibleUploadConfig = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Chấp nhận tất cả các loại file phổ biến, sẽ validate chi tiết trong controller
    const allowedMimeTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
      // Video
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ]

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} không được hỗ trợ`), false)
    }
  },
  limits: {
    fileSize: undefined, // Bỏ giới hạn kích thước file - sẽ validate chi tiết trong controller
    files: 1
  }
}
