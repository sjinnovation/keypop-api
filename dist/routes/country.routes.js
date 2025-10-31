"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthMiddleware_1 = require("../global/middlewares/userAuthMiddleware");
const requireAdminRole_1 = require("../global/middlewares/requireAdminRole");
const country_controller_1 = require("../controllers/country.controller");
const router = express_1.default.Router();
router.post("/", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, country_controller_1.addCountry);
router.get("/all", country_controller_1.getAllCountries);
router.get("/", country_controller_1.getCountryByCountryCode);
router.get("/:id", userAuthMiddleware_1.authMiddleware, country_controller_1.getCountryByID);
router.put("/update-status/:id", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, country_controller_1.updateCountryStatus);
router.delete("/:id", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, country_controller_1.deleteCountry);
exports.default = router;
