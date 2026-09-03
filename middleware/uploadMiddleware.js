import multer from "multer";


// ================================================================
// MEMORY STORAGE
// ================================================================

const storage = multer.memoryStorage();


// ================================================================
// FILE FILTER
// ================================================================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [

    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",

    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",

    // Raw / documents if required later
    "application/pdf",
  ];


  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(null, true);
  }


  return cb(
    new Error(
      `Unsupported file type: ${file.mimetype}`
    ),
    false
  );
};


// ================================================================
// MULTER
// ================================================================

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize:
      50 * 1024 * 1024,
  },
});


export default upload;