const { analyzeCode } = require("../services/codeAnalysisService");

const MAX_CODE_SIZE_BYTES = 100 * 1024; // 100 KB limit
const DEFAULT_FILENAME = "snippet.js";

/**
 * Validates request payload and runs static analysis on provided JavaScript/JSX snippet.
 */
async function analyze(req, res, next) {
  try {
    const { code, filename } = req.body || {};

    if (code === undefined || code === null) {
      return res.status(400).json({
        success: false,
        message: "Source code is required",
      });
    }

    if (typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Source code must be a string",
      });
    }

    if (code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Source code cannot be empty",
      });
    }

    const codeSizeBytes = Buffer.byteLength(code, "utf8");
    if (codeSizeBytes > MAX_CODE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `Source code exceeds maximum permitted size of 100 KB (received ${Math.round(codeSizeBytes / 1024)} KB)`,
      });
    }

    const safeFilename =
      typeof filename === "string" && filename.trim().length > 0
        ? filename.trim().slice(0, 128)
        : DEFAULT_FILENAME;

    const analysisResult = analyzeCode(code, safeFilename);

    return res.status(200).json({
      success: true,
      message: analysisResult.parsed ? "Analysis completed successfully" : "Analysis completed with syntax errors",
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyze,
};
