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
exports.generateCSV = exports.generatePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const csv_writer_1 = require("csv-writer");
// Helper function to format keys for display (e.g., phoneNumber -> Phone Number)
const formatHeader = (key) => {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/_/g, " ");
};
// Helper function to get dynamic headers from tableData
const getDynamicHeaders = (tableData) => {
    if (!tableData.length)
        return [];
    const firstRow = tableData[0];
    // Exclude internal fields like __v and _id (optional: adjust as needed)
    return Object.keys(firstRow).filter((key) => !["__v", "_id"].includes(key));
};
// Helper function to calculate dynamic column widths based on headers
const getDynamicColumnWidths = (headers, pageWidth) => {
    const totalWidth = pageWidth - 100; // Account for margins (50 each side)
    const baseWidth = totalWidth / headers.length;
    return headers.map(() => Math.max(80, Math.min(baseWidth, 150))); // Min 80, max 150
};
const generatePDF = (tableData) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({
            margin: 50,
            bufferPages: true,
            autoFirstPage: false
        });
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
        doc.info['Title'] = 'Contact Requests Export Data';
        doc.info['Author'] = 'KeyPop - APCOM';
        doc.info['CreationDate'] = new Date();
        // Title
        doc.addPage();
        doc.fontSize(20).font("Helvetica-Bold").text("Contact Requests", { align: "center" });
        doc.moveDown(0.5);
        doc
            .fontSize(10)
            .font("Helvetica")
            .text(`Admin: KeyPop - APCOM`, { align: "center" })
            .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
        doc.moveDown(1);
        // Handle empty data
        if (!tableData.length) {
            doc.fontSize(12).font("Helvetica").text("No data available.", 50, doc.y);
            doc.end();
            return;
        }
        // Get dynamic headers
        const headers = getDynamicHeaders(tableData);
        const formattedHeaders = headers.map(formatHeader);
        const pageWidth = doc.page.width - 100; // Margins: 50 each side
        const padding = 5;
        // Draw each record as a card
        tableData.forEach((row, index) => {
            // Check for page break
            if (doc.y > doc.page.height - 150) {
                doc.addPage();
                doc.fontSize(20).font("Helvetica-Bold").text("Contact Requests (Continued)", { align: "center" });
                doc.moveDown(1.5);
            }
            // Card header
            doc.fontSize(14).font("Helvetica-Bold").text(`Record ${index + 1}`, 50, doc.y);
            doc.moveDown(0.5);
            // Draw border around card
            const cardTop = doc.y;
            let cardHeight = 0;
            // Calculate card height by rendering fields
            headers.forEach((key, i) => {
                let cellValue = row[key] || "";
                if (key.includes("At") && cellValue) {
                    cellValue = new Date(cellValue).toLocaleDateString("en-US", {
                        month: "numeric",
                        day: "numeric",
                        year: "2-digit",
                    });
                }
                // Label
                doc.fontSize(12).font("Helvetica-Bold").text(`${formattedHeaders[i]}:`, 50, doc.y, {
                    continued: true,
                });
                // Value
                doc.fontSize(11).font("Helvetica").text(` ${cellValue}`, {
                    width: pageWidth,
                    align: "left",
                });
                doc.moveDown(0.3);
            });
            // Calculate card height
            cardHeight = doc.y - cardTop;
            // Draw border
            doc
                .lineWidth(1)
                .strokeColor("#cccccc")
                .rect(50, cardTop - padding, pageWidth, cardHeight + 2 * padding)
                .stroke();
            // Separator
            doc.moveDown(1);
            doc
                .lineWidth(1)
                .strokeColor("#cccccc")
                .moveTo(50, doc.y)
                .lineTo(50 + pageWidth, doc.y)
                .stroke();
            doc.moveDown(1);
        });
        doc.end();
    });
});
exports.generatePDF = generatePDF;
const generateCSV = (tableData) => __awaiter(void 0, void 0, void 0, function* () {
    // Get dynamic headers
    const headers = getDynamicHeaders(tableData);
    if (!headers.length) {
        return Buffer.from("No data available.");
    }
    // Create CSV header configuration
    const csvHeaders = headers.map((key) => ({
        id: key,
        title: formatHeader(key),
    }));
    const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({
        header: csvHeaders,
    });
    // Map tableData to CSV records
    const records = tableData.map((row) => headers.reduce((acc, key) => {
        let value = row[key] || "";
        if (key.includes("At") && value) {
            value = new Date(value).toLocaleString(); // Format dates
        }
        return Object.assign(Object.assign({}, acc), { [key]: value });
    }, {}));
    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
    return Buffer.from(csvString);
});
exports.generateCSV = generateCSV;
