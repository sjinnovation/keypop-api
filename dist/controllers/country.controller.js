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
exports.deleteCountry = exports.updateCountryStatus = exports.getCountryByCountryCode = exports.getCountryByID = exports.getAllCountries = exports.addCountry = void 0;
const catchAsync_1 = __importDefault(require("../global/middlewares/catchAsync"));
const sendResponse_1 = __importDefault(require("../global/middlewares/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const Messages_1 = require("../Constants/Messages");
const country_service_1 = require("../services/country.service");
// Controller for managing countries
exports.addCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, code } = req.body;
    const country = yield (0, country_service_1.addCountryService)(name, code);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: Messages_1.ApiMessages.COUNTRY_ADDED,
        data: country,
    });
}));
// Controller for fetching all countries
exports.getAllCountries = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const countries = yield (0, country_service_1.getAllCountriesService)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.COUNTRIES_FETCHED,
        data: countries,
    });
}));
// Controller for fetching a single country by ID
exports.getCountryByID = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const country = yield (0, country_service_1.getCountryByIDService)(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.COUNTRY_FETCHED,
        data: country,
    });
}));
exports.getCountryByCountryCode = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, id } = req.query;
    const country = yield (0, country_service_1.getCountryByCountryCodeService)({ code, id });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.COUNTRY_FETCHED,
        data: country,
    });
}));
// Controller for updating the status of a country
exports.updateCountryStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { isActive } = req.body;
    const updatedCountry = yield (0, country_service_1.updateCountryStatusService)(id, isActive);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.COUNTRY_STATUS_UPDATED,
        data: updatedCountry,
    });
}));
// Controller for deleting a country
exports.deleteCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const country = yield (0, country_service_1.deleteCountryService)(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.COUNTRY_DELETED,
        data: country,
    });
}));
