"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const contactRequest_routes_1 = __importDefault(require("./routes/contactRequest.routes"));
const country_routes_1 = __importDefault(require("./routes/country.routes"));
const survey_routes_1 = __importDefault(require("./routes/survey.routes"));
const GlobalErrorHandler_1 = __importDefault(require("./global/errors/GlobalErrorHandler"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/user", user_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/contact-request", contactRequest_routes_1.default);
app.use("/api/export", export_routes_1.default);
// Country Routes
app.use("/api/country", country_routes_1.default);
// Survey Routes
app.use("/api/survey", survey_routes_1.default);
// Static Files
if (process.env.NODE_ENV !== 'production') {
    app.use('/static', express_1.default.static(path_1.default.join(__dirname, '../src/assets')));
}
else {
    // For production (when running from dist)
    app.use('/static', express_1.default.static(path_1.default.join(__dirname, 'assets')));
}
// Global Error Handler
app.use(GlobalErrorHandler_1.default);
exports.default = app;
