import multer from "multer";

const maxMb = Number(process.env.MAX_UPLOAD_MB || 250);

export const uploadPdf = multer({
  dest: "tmp_uploads/",
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Accept PDF only
    if (file.mimetype !== "application/pdf") return cb(new Error("Only PDF allowed"));
    cb(null, true);
  }
});
