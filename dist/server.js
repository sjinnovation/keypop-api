"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const env_1 = require("./config/env");
const PORT = env_1.envConfig.PORT || 5000;
(0, database_1.default)();
app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
