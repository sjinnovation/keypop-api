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
exports.updateContactRequestStatus = exports.getContactRequests = exports.addContactRequest = void 0;
const catchAsync_1 = __importDefault(require("../global/middlewares/catchAsync"));
const sendResponse_1 = __importDefault(require("../global/middlewares/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const Messages_1 = require("../Constants/Messages");
const contactRequest_service_1 = require("../services/contactRequest.service");
exports.addContactRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber, message } = req.body;
    const newRequest = yield (0, contactRequest_service_1.addContactRequestService)(name, email, phoneNumber, message);
    (0, sendResponse_1.default)(res, {
        statusCode: newRequest.isNewRequest ? http_status_1.default.CREATED : http_status_1.default.OK,
        success: true,
        message: newRequest.isNewRequest ? Messages_1.ApiMessages.CONTACT_REQUEST_ADDED : Messages_1.ApiMessages.CONTACT_REQUEST_EXISTS,
        data: newRequest
    });
}));
exports.getContactRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, startDate, endDate } = req.query;
    const result = yield (0, contactRequest_service_1.getContactRequestsService)({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        startDate: startDate,
        endDate: endDate
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.CONTACT_REQUEST_FETCHED,
        data: result
    });
}));
exports.updateContactRequestStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    yield (0, contactRequest_service_1.updateContactRequestStatusService)(id, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.CONTACT_REQUEST_STATUS_UPDATED,
    });
}));
