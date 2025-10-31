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
exports.deleteCountryService = exports.updateCountryStatusService = exports.getCountryByCountryCodeService = exports.getCountryByIDService = exports.getAllCountriesService = exports.addCountryService = void 0;
const country_model_1 = __importDefault(require("../models/country.model"));
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
// Add a new country
const addCountryService = (name, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingCountry = yield country_model_1.default.findOne({ code });
        if (existingCountry) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Country already exists.");
        }
        const country = new country_model_1.default({ name, code });
        yield country.save();
        return country;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error adding country");
    }
});
exports.addCountryService = addCountryService;
// Get all active countries
const getAllCountriesService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield country_model_1.default.find({ isActive: true });
        return countries;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error fetching countries");
    }
});
exports.getAllCountriesService = getAllCountriesService;
// Get a specific country by ID
const getCountryByIDService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = yield country_model_1.default.findById(id);
        if (!country) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Country not found");
        }
        return country;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error fetching country details");
    }
});
exports.getCountryByIDService = getCountryByIDService;
// Get a specific country by country code
const getCountryByCountryCodeService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ code, id, }) {
    try {
        let country;
        if (code) {
            country = yield country_model_1.default.findOne({ code: code.toUpperCase() });
        }
        if (!country) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Country not found");
        }
        return country;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error fetching country details");
    }
});
exports.getCountryByCountryCodeService = getCountryByCountryCodeService;
// Update a specific country by ID
const updateCountryStatusService = (id, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedCountry = yield country_model_1.default.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true });
        if (!updatedCountry) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Country not found");
        }
        return updatedCountry;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error updating country status");
    }
});
exports.updateCountryStatusService = updateCountryStatusService;
// Update a specific country by ID with new name and code
const deleteCountryService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = yield country_model_1.default.findById(id);
        if (!country) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Country not found");
        }
        yield country.deleteOne();
        return country;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error deleting country");
    }
});
exports.deleteCountryService = deleteCountryService;
