"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.uploadVideo = exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'house-haunters/images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});
const videoStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'house-haunters/videos',
        resource_type: 'auto',
        // allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
    },
});
exports.upload = (0, multer_1.default)({ storage: storage });
exports.uploadVideo = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});
