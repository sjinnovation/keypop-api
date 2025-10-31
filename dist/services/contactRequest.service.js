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
exports.updateContactRequestStatusService = exports.getContactRequestsService = exports.addContactRequestService = void 0;
const contactRequest_model_1 = __importDefault(require("../models/contactRequest.model"));
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const addContactRequestService = (name, email, phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let contactRequest = yield contactRequest_model_1.default.findOne({ message });
        if (contactRequest) {
            throw new ApiError_1.default(400, 'A contact request with this message already exists.');
        }
        contactRequest = new contactRequest_model_1.default({ name, email, phoneNumber, message });
        yield contactRequest.save();
        contactRequest.isNewRequest = true;
        return contactRequest;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || 'Error processing contact request');
    }
});
exports.addContactRequestService = addContactRequestService;
const getContactRequestsService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = options;
        const query = {};
        if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt = Object.assign(Object.assign({}, query.createdAt), { $lte: end });
        }
        const skip = (page - 1) * limit;
        const total = yield contactRequest_model_1.default.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const contactRequests = yield contactRequest_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return {
            contactRequests,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Failed to fetch contact requests");
    }
});
exports.getContactRequestsService = getContactRequestsService;
const updateContactRequestStatusService = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield contactRequest_model_1.default.findByIdAndUpdate(id, { status });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode, error.message);
    }
});
exports.updateContactRequestStatusService = updateContactRequestStatusService;
