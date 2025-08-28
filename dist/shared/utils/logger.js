'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const winston_1 = __importDefault(require('winston'))
const path_1 = require('path')
const logger = winston_1.default.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston_1.default.format.combine(
    winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston_1.default.format.errors({ stack: true }),
    winston_1.default.format.splat(),
    winston_1.default.format.json()
  ),
  transports: [
    new winston_1.default.transports.Console({
      format: winston_1.default.format.combine(
        winston_1.default.format.colorize(),
        winston_1.default.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`
        })
      ),
    }),
    new winston_1.default.transports.File({
      filename: (0, path_1.join)(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
    }),
    new winston_1.default.transports.File({
      filename: (0, path_1.join)(__dirname, '../logs/combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
    }),
  ],
})
exports.default = logger
