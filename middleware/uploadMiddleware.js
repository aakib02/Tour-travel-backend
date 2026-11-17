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

    // Documents
    "application/pdf",

    // Spreadsheets & CSV
    "text/csv",
    "text/plain",
    "text/x-csv",
    "application/csv",
    "application/x-csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
  ];

  const isAllowedExt = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|pdf|csv|xlsx|xls)$/i.test(
    file.originalname || ""
  );

  if (
    allowedMimeTypes.includes(
      file.mimetype
    ) ||
    isAllowedExt
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