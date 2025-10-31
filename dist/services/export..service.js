"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDataService = void 0;
const exportServices_1 = require("../Utils/exportServices");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const exportDataService = (type, tableData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        let buffer;
        let fileName;
        switch (type.toLowerCase()) {
            case "pdf":
                buffer = yield (0, exportServices_1.generatePDF)(tableData);
                fileName = `contact-requests-${timestamp}.pdf`;
                break;
            case "csv":
                buffer = yield (0, exportServices_1.generateCSV)(tableData);
                fileName = `contact-requests-${timestamp}.csv`;
                break;
            default:
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Unsupported file type. Use 'pdf' or 'csv'.");
        }
        return { buffer, fileName };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Failed to generate file.");
    }
});
exports.exportDataService = exportDataService;
