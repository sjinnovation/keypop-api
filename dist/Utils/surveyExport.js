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
exports.generateSurveySummaryCSV = exports.generateSurveySummaryPDF = exports.generateAllResponsesCSV = exports.generateAllResponsesPDF = exports.answerToReadableString = exports.compareQuestionCodes = exports.generateSurveyResponseCSVWide = exports.generateSurveyResponseCSV = exports.generateSurveyResponsePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const csv_writer_1 = require("csv-writer");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
// Initialize chart renderer
const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({
    width: 400,
    height: 300,
    backgroundColour: 'white'
});
// PDF generation for single survey response
const generateSurveyResponsePDF = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Survey Response - ${data.surveyTitle}`,
                Author: data.userName,
                Subject: 'Survey Response Report',
                CreationDate: new Date()
            }
        });
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
        // Define colors
        const colors = {
            primary: '#2c3e50',
            secondary: '#34495e',
            success: '#27ae60',
            info: '#3498db',
            muted: '#7f8c8d',
            light: '#ecf0f1'
        };
        // Header Section
        doc.fontSize(24).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Survey Response Report", { align: "center" });
        doc.moveDown(0.5);
        // Survey Title
        doc.fontSize(18).font("Helvetica")
            .fillColor(colors.secondary)
            .text(data.surveyTitle, { align: "center" });
        doc.moveDown(2);
        // Respondent Information Box
        doc.roundedRect(50, doc.y, doc.page.width - 100, 80, 5)
            .fillAndStroke(colors.light, colors.light);
        const infoBoxY = doc.y + 10;
        doc.fontSize(12).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Respondent Information", 70, infoBoxY);
        doc.fontSize(10).font("Helvetica")
            .fillColor(colors.secondary)
            .text(`Name: ${data.userName}`, 70, infoBoxY + 20)
            .text(`Email: ${data.userEmail}`, 70, infoBoxY + 35)
            .text(`Country: ${data.surveyCountry}`, 300, infoBoxY + 20)
            .text(`Submitted: ${new Date(data.submittedAt).toLocaleString()}`, 300, infoBoxY + 35);
        doc.y = infoBoxY + 70;
        doc.moveDown(2);
        // Response Summary
        doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Response Summary", 50, doc.y, {
            width: doc.page.width - 100,
            align: "center"
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica")
            .fillColor(colors.secondary)
            .text(`Total Questions Answered: ${data.answers.length}`, 50, doc.y, {
            width: doc.page.width - 100,
            align: "center"
        })
            .text(`Categories Covered: ${data.categories.length}`, 50, doc.y, {
            width: doc.page.width - 100,
            align: "center"
        });
        doc.moveDown(2);
        // Responses by Category
        doc.fontSize(16).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Detailed Responses", 50, doc.y, {
            width: doc.page.width - 100,
            align: "center"
        });
        doc.moveDown();
        // Process each category
        data.categories.forEach((category, catIndex) => {
            // Check for page break
            if (doc.y > doc.page.height - 150) {
                doc.addPage();
                doc.fontSize(16).font("Helvetica-Bold")
                    .fillColor(colors.primary)
                    .text("Detailed Responses (Continued)", { align: "center" });
                doc.moveDown();
            }
            // Category Header with background
            const categoryY = doc.y;
            doc.rect(50, categoryY - 5, doc.page.width - 100, 25)
                .fill(colors.light);
            doc.fontSize(14).font("Helvetica-Bold")
                .fillColor(colors.primary)
                .text(`${catIndex + 1}. ${category.title}`, 60, categoryY);
            doc.y = categoryY + 25;
            doc.moveDown(0.5);
            // Get answers for this category
            const categoryAnswers = data.answers.filter((a) => a.categoryCode === category.code);
            if (categoryAnswers.length === 0) {
                doc.fontSize(10).font("Helvetica-Oblique")
                    .fillColor(colors.muted)
                    .text("No responses in this category", 70);
                doc.moveDown();
                return;
            }
            // Process each answer
            categoryAnswers.forEach((answer, ansIndex) => {
                // Check for page break
                if (doc.y > doc.page.height - 100) {
                    doc.addPage();
                }
                // Question number and code
                doc.fontSize(11).font("Helvetica-Bold")
                    .fillColor(colors.secondary)
                    .text(`Q${answer.code}`, 70, doc.y, { continued: true })
                    .font("Helvetica")
                    .text(`: ${answer.questionText}`, {
                    width: doc.page.width - 140,
                    align: 'left'
                });
                doc.moveDown(0.3);
                // Answer based on type
                doc.fontSize(10);
                switch (answer.answerType) {
                    case 'YesNo':
                        const isYes = answer.value === true || answer.value === 'Yes' || answer.formattedValue === 'Yes';
                        doc.font("Helvetica-Bold")
                            .fillColor(isYes ? colors.success : colors.secondary)
                            .text("Answer: ", 90, doc.y, { continued: true })
                            .text(isYes ? 'Yes' : 'No');
                        break;
                    case 'Rating':
                        const rating = parseInt(answer.value) || parseInt(answer.formattedValue);
                        doc.font("Helvetica-Bold")
                            .fillColor(colors.info)
                            .font("Helvetica")
                            .text(`         Rating: (${rating}/5)`);
                        break;
                    case 'MCQ':
                        doc.font("Helvetica-Bold")
                            .fillColor(colors.secondary)
                            .text("Answer: ", 90, doc.y, { continued: true })
                            .font("Helvetica")
                            .text(answer.formattedValue, {
                            width: doc.page.width - 160,
                            align: 'left'
                        });
                        break;
                    default:
                        doc.font("Helvetica-Bold")
                            .fillColor(colors.secondary)
                            .text("Answer: ", 90, doc.y, { continued: true })
                            .font("Helvetica")
                            .text(answer.formattedValue);
                }
                doc.moveDown(0.3);
                if (answer.keyPopulation &&
                    typeof answer.keyPopulation === 'string' &&
                    answer.keyPopulation !== 'General' &&
                    answer.keyPopulation.trim() !== '') {
                    doc.fontSize(9).font("Helvetica-Oblique")
                        .fillColor(colors.muted)
                        .text(`Key Population: ${answer.keyPopulation}`, 90);
                    doc.moveDown(0.3);
                }
                doc.fillColor('#000000');
                // Add separator between questions (except for last question)
                if (ansIndex < categoryAnswers.length - 1) {
                    doc.strokeColor(colors.light)
                        .lineWidth(0.5)
                        .moveTo(70, doc.y)
                        .lineTo(doc.page.width - 70, doc.y)
                        .stroke();
                    doc.moveDown(0.5);
                }
            });
            doc.moveDown();
        });
        // Add footer with timestamp
        const currentY = doc.y;
        doc.fontSize(8).font("Helvetica")
            .fillColor(colors.muted)
            .text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 25, { align: 'center', width: doc.page.width - 100 });
        // End the document
        doc.end();
    });
});
exports.generateSurveyResponsePDF = generateSurveyResponsePDF;
// CSV generation for single survey response
const generateSurveyResponseCSV = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Prepare records with all necessary information
    const records = data.answers.map((answer, index) => ({
        'Response ID': index + 1,
        'Question Code': answer.code,
        'Category': answer.categoryTitle,
        'Question': answer.questionText,
        'Answer Type': answer.answerType,
        'Answer': answer.formattedValue,
        'Raw Answer': answer.value, // Include raw value for data analysis
        'Key Population': answer.keyPopulation || 'General',
        'Survey Title': data.surveyTitle,
        'Survey Country': data.surveyCountry,
        'Respondent Name': data.userName,
        'Respondent Email': data.userEmail,
        'Submitted At': new Date(data.submittedAt).toLocaleString(),
        'Submission Date': new Date(data.submittedAt).toISOString().split('T')[0],
        'Submission Time': new Date(data.submittedAt).toISOString().split('T')[1].split('.')[0]
    }));
    // Define CSV headers with proper ordering
    const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({
        header: [
            { id: 'Response ID', title: 'Response ID' },
            { id: 'Question Code', title: 'Question Code' },
            { id: 'Category', title: 'Category' },
            { id: 'Question', title: 'Question' },
            { id: 'Answer Type', title: 'Answer Type' },
            { id: 'Answer', title: 'Answer' },
            { id: 'Raw Answer', title: 'Raw Answer' },
            { id: 'Key Population', title: 'Key Population' },
            { id: 'Survey Title', title: 'Survey Title' },
            { id: 'Survey Country', title: 'Survey Country' },
            { id: 'Respondent Name', title: 'Respondent Name' },
            { id: 'Respondent Email', title: 'Respondent Email' },
            { id: 'Submitted At', title: 'Submitted At' },
            { id: 'Submission Date', title: 'Submission Date' },
            { id: 'Submission Time', title: 'Submission Time' }
        ]
    });
    // Add metadata as comments at the beginning of the file
    const metadata = [
        `# Survey Response Export`,
        `# Survey: ${data.surveyTitle}`,
        `# Country: ${data.surveyCountry}`,
        `# Respondent: ${data.userName} (${data.userEmail})`,
        `# Export Date: ${new Date().toLocaleString()}`,
        `# Total Responses: ${data.answers.length}`,
        `#`,
        ``
    ].join('\n');
    const csvString = metadata +
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records);
    return Buffer.from(csvString, 'utf-8');
});
exports.generateSurveyResponseCSV = generateSurveyResponseCSV;
// Alternative CSV format - Wide format (one row per response)
const generateSurveyResponseCSVWide = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a single row with all answers as columns
    const record = {
        'Respondent Name': data.userName,
        'Respondent Email': data.userEmail,
        'Survey Title': data.surveyTitle,
        'Survey Country': data.surveyCountry,
        'Submitted At': new Date(data.submittedAt).toLocaleString()
    };
    // Add each answer as a column
    data.answers.forEach((answer) => {
        const columnName = `${answer.code}: ${answer.questionText.substring(0, 50)}`;
        record[columnName] = answer.formattedValue;
        // Add answer type as metadata
        record[`${columnName} (Type)`] = answer.answerType;
        // Add key population if relevant
        if (answer.keyPopulation && answer.keyPopulation !== 'General') {
            record[`${columnName} (KP)`] = answer.keyPopulation;
        }
    });
    // Create headers dynamically
    const headers = Object.keys(record).map(key => ({
        id: key,
        title: key
    }));
    const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({ header: headers });
    const csvString = csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords([record]);
    return Buffer.from(csvString, 'utf-8');
});
exports.generateSurveyResponseCSVWide = generateSurveyResponseCSVWide;
// Helper function to create charts
const createChart = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width: 400, height: 200 });
    return yield chartJSNodeCanvas.renderToBuffer(config);
});
/** e.g. 1.1.2 before 1.1.10 */
const compareQuestionCodes = (a, b) => {
    var _a, _b;
    const pa = String(a).split(".").map((x) => parseInt(x, 10) || 0);
    const pb = String(b).split(".").map((x) => parseInt(x, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const d = ((_a = pa[i]) !== null && _a !== void 0 ? _a : 0) - ((_b = pb[i]) !== null && _b !== void 0 ? _b : 0);
        if (d !== 0)
            return d;
    }
    return String(a).localeCompare(String(b));
};
exports.compareQuestionCodes = compareQuestionCodes;
/** Human-readable answer: Skipped, Yes/No, 4/5, etc. */
const answerToReadableString = (ans) => {
    if (ans === null || ans === void 0 ? void 0 : ans.skipped)
        return "Skipped";
    if ((ans === null || ans === void 0 ? void 0 : ans.formattedValue) != null && String(ans.formattedValue).trim() !== "") {
        return String(ans.formattedValue);
    }
    const v = ans === null || ans === void 0 ? void 0 : ans.value;
    if (v === null || v === undefined || v === "")
        return "—";
    if (Array.isArray(v))
        return v.join(", ");
    if (typeof v === "boolean")
        return v ? "Yes" : "No";
    if (typeof v === "object")
        return JSON.stringify(v);
    return String(v);
};
exports.answerToReadableString = answerToReadableString;
const ensureRoom = (doc, minBottom) => {
    const limit = doc.page.maxY() - minBottom;
    if (doc.y > limit) {
        doc.addPage();
        doc.y = doc.page.margins.top;
    }
};
// PDF: cover + index, then each respondent on new pages — answers by survey section with full question text.
const generateAllResponsesPDF = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const doc = new pdfkit_1.default({
            margin: 50,
            size: "A4",
            // Flush pages as we go — avoids empty trailing pages from bufferPages + switchToPage footers
            bufferPages: false,
            autoFirstPage: true,
            info: {
                Title: `All Responses - ${data.survey.title}`,
                Author: "Survey System",
                Subject: "Survey Responses Report",
                CreationDate: new Date(),
            },
        });
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
        const colors = {
            primary: "#2c3e50",
            secondary: "#34495e",
            muted: "#7f8c8d",
            light: "#ecf0f1",
        };
        const categories = Array.isArray(data.survey.categories) ? data.survey.categories : [];
        const qCount = Math.max(1, ((_a = data.survey.questions) === null || _a === void 0 ? void 0 : _a.length) || 1);
        const categoryByCode = new Map(categories.map((c) => [c.code, c]));
        doc.fontSize(22).font("Helvetica-Bold").fillColor(colors.primary).text("Survey responses export", {
            align: "center",
        });
        doc.moveDown(0.5);
        doc.fontSize(16).font("Helvetica").fillColor(colors.secondary).text(data.survey.title, { align: "center" });
        doc.moveDown(1);
        doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
        doc.text(`Country / region: ${((_b = data.survey.country) === null || _b === void 0 ? void 0 : _b.name) || "N/A"}`);
        doc.text(`Submissions in this file: ${data.totalResponses}`);
        doc.text(`Exported: ${new Date().toLocaleString()}`);
        doc.moveDown(0.8);
        doc.roundedRect(50, doc.y, doc.page.width - 100, 118, 4).fillAndStroke(colors.light, colors.muted);
        const guideTop = doc.y + 8;
        doc.fontSize(11).font("Helvetica-Bold").fillColor(colors.primary).text("How to read this document", 60, guideTop);
        doc.fontSize(9).font("Helvetica").fillColor("#000000");
        doc.text("1. This PDF has two parts: (A) this summary and list of everyone who submitted, (B) one chapter per person with every question and answer in survey order.", 60, guideTop + 16, { width: doc.page.width - 120 });
        doc.text("2. For each person you will see blocks by survey section (e.g. consent, access, quality). Each item shows the question wording, the type of answer (Yes/No, rating 1–5, text, etc.), and the answer they gave.", 60, guideTop + 42, { width: doc.page.width - 120 });
        doc.text('3. "Question 3 of 24" counts only that person\'s questions so you can see progress through their form.', 60, guideTop + 68, { width: doc.page.width - 120 });
        doc.y = guideTop + 108;
        doc.moveDown(0.6);
        doc.fontSize(12).font("Helvetica-Bold").fillColor(colors.primary).text("Submissions by date");
        doc.fontSize(10).font("Helvetica").fillColor(colors.secondary);
        const timelineData = Object.entries(data.responsesByDate).sort((a, b) => a[0].localeCompare(b[0]));
        if (timelineData.length === 0) {
            doc.text("  (none)");
        }
        else {
            timelineData.forEach(([date, count]) => {
                doc.text(`  • ${date}: ${count}`);
            });
        }
        doc.moveDown(1);
        doc.fontSize(12).font("Helvetica-Bold").fillColor(colors.primary).text("Respondent index");
        doc.fontSize(9).font("Helvetica").fillColor(colors.secondary);
        data.responses.forEach((response, index) => {
            const pct = ((response.answers.length / qCount) * 100).toFixed(0);
            doc.text(`  ${index + 1}. ${response.userName || "—"} (${response.userEmail || "—"}) — ${new Date(response.submittedAt).toLocaleString()} — ~${pct}% of questions`);
        });
        doc.moveDown(0.8);
        doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.primary).text("Next section of the PDF", {
            underline: true,
        });
        doc.fontSize(9).font("Helvetica").fillColor(colors.muted).text("Starting on the following page: the same list as above, but with full question text and each answer, one person at a time.", { width: doc.page.width - 100 });
        data.responses.forEach((response, respIdx) => {
            doc.addPage();
            doc.y = doc.page.margins.top;
            const totalQ = (response.answers || []).length;
            let qIndex = 0;
            doc.fontSize(8).font("Helvetica").fillColor(colors.muted).text(`Survey export · ${data.survey.title}`, {
                width: doc.page.width - 100,
                align: "right",
            });
            doc.moveDown(0.2);
            doc.fontSize(18).font("Helvetica-Bold").fillColor(colors.primary).text(`Submission ${respIdx + 1} of ${data.totalResponses}`);
            doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2).strokeColor(colors.muted).lineWidth(1).stroke();
            doc.moveDown(0.35);
            doc.fontSize(11).font("Helvetica-Bold").fillColor(colors.secondary).text("Who submitted");
            doc.fontSize(10).font("Helvetica").fillColor("#000000");
            doc.text(`Name: ${response.userName || "—"}`);
            doc.text(`Email: ${response.userEmail || "—"}`);
            doc.text(`Submitted: ${new Date(response.submittedAt).toLocaleString()}`);
            doc.text(`Form status: ${response.isComplete ? "Complete" : "Partial"} · ${totalQ} answers in this export`);
            doc.moveDown(0.5);
            doc.fontSize(9).font("Helvetica-Oblique").fillColor(colors.muted).text("Below: sections match the live survey. Each row is one question, then its type label, then the answer.", { width: doc.page.width - 100 });
            doc.moveDown(0.6);
            const answersByCat = new Map();
            for (const ans of response.answers || []) {
                const code = ans.categoryCode || "_other";
                if (!answersByCat.has(code))
                    answersByCat.set(code, []);
                answersByCat.get(code).push(ans);
            }
            const orderedCategoryCodes = [];
            categories.forEach((c) => {
                if (answersByCat.has(c.code))
                    orderedCategoryCodes.push(c.code);
            });
            answersByCat.forEach((_v, code) => {
                if (!orderedCategoryCodes.includes(code))
                    orderedCategoryCodes.push(code);
            });
            const sectionCount = Math.max(1, orderedCategoryCodes.length);
            let sectionPart = 0;
            for (const catCode of orderedCategoryCodes) {
                const catAnswers = answersByCat.get(catCode);
                if (!(catAnswers === null || catAnswers === void 0 ? void 0 : catAnswers.length))
                    continue;
                catAnswers.sort((a, b) => (0, exports.compareQuestionCodes)(a.code, b.code));
                sectionPart += 1;
                ensureRoom(doc, 130);
                const catMeta = categoryByCode.get(catCode);
                const sectionTitle = (catMeta === null || catMeta === void 0 ? void 0 : catMeta.title) || `Section ${catCode}`;
                doc.rect(50, doc.y, doc.page.width - 100, 22).fill(colors.light);
                const secY = doc.y;
                doc.fontSize(12).font("Helvetica-Bold").fillColor(colors.primary).text(`Part ${sectionPart} of ${sectionCount}: ${sectionTitle}`, 56, secY + 5, { width: doc.page.width - 112 });
                doc.y = secY + 28;
                for (const ans of catAnswers) {
                    qIndex += 1;
                    ensureRoom(doc, 100);
                    const blockTop = doc.y;
                    doc.rect(52, blockTop - 2, doc.page.width - 104, 1).fill(colors.muted);
                    const qText = String(ans.questionText || "Question")
                        .replace(/\r?\n/g, " ")
                        .trim();
                    const line = (0, exports.answerToReadableString)(ans);
                    const typeLabel = ans.answerType === "Rating"
                        ? "Rating (scale 1–5; shown as N/5)"
                        : ans.answerType === "YesNo"
                            ? "Yes / No"
                            : ans.answerType === "MCQ"
                                ? "Multiple choice (one or more options)"
                                : String(ans.answerType || "Open answer");
                    doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.secondary).text(`Question ${qIndex} of ${totalQ}  ·  Code ${ans.code}`);
                    doc.font("Helvetica-Bold").fillColor("#000000").fontSize(10).text("Question wording: ", {
                        continued: true,
                    });
                    doc.font("Helvetica").text(qText, {
                        width: doc.page.width - 108,
                    });
                    doc.moveDown(0.15);
                    doc.fontSize(9).font("Helvetica-Bold").fillColor(colors.muted).text("What kind of answer: ", {
                        continued: true,
                    });
                    doc.font("Helvetica").fillColor("#000000").text(typeLabel);
                    doc.fontSize(10).font("Helvetica-Bold").text("Their answer: ", { continued: true });
                    doc.font("Helvetica").text(line, { width: doc.page.width - 108 });
                    if (Array.isArray(ans.keyPopulation) && ans.keyPopulation.length > 0) {
                        doc.fontSize(9).fillColor(colors.muted).text(`Key population note: ${ans.keyPopulation.join(", ")}`);
                    }
                    doc.fillColor("#000000");
                    doc.moveDown(0.75);
                }
            }
        });
        doc.end();
    });
});
exports.generateAllResponsesPDF = generateAllResponsesPDF;
/** RFC 4180 field: always double-quoted so Excel never splits on commas inside questions/answers. */
const csvQuote = (value) => {
    const s = String(value !== null && value !== void 0 ? value : "");
    return `"${s.replace(/"/g, '""')}"`;
};
const csvRow = (cells) => cells.map(csvQuote).join(",") + "\r\n";
// CSV: one row per answer — every column quoted, UTF-8 BOM, CRLF (Excel-safe).
// Structure: instruction rows, then for each submission a banner row and numbered answer rows (respondent repeated only on answer 1).
const generateAllResponsesCSV = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const categories = Array.isArray(data.survey.categories) ? data.survey.categories : [];
    const sectionTitleByCode = new Map(categories.map((c) => [String(c.code), String(c.title || c.code)]));
    const headerTitles = [
        "Submission #",
        "Answer # (this person)",
        "Who submitted (only on row 1 per person; leave blank = same person as above)",
        "Survey section",
        "Question code",
        "Question text",
        "Answer type",
        "Answer (readable)",
    ];
    const nSub = (_c = (_a = data.totalResponses) !== null && _a !== void 0 ? _a : (_b = data.responses) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
    const titleOneLine = String(data.survey.title || "").replace(/\r?\n/g, " ").trim();
    const isoNow = new Date().toISOString();
    const rows = [];
    rows.push(csvRow(headerTitles));
    rows.push(csvRow([
        "HOW TO READ",
        "Scroll to each ▼ START row to see the next person. Under that banner, Answer # is 1..N for that person only. Column Who is filled on answer 1 only.",
        "",
        "",
        "",
        "",
        "",
        "",
    ]));
    rows.push(csvRow([
        "META",
        `${titleOneLine} | country=${String(((_d = data.survey.country) === null || _d === void 0 ? void 0 : _d.name) || "N/A")} | exported_UTC=${isoNow} | submissions=${nSub}`,
        "",
        "",
        "",
        "",
        "",
        "Answer values: Yes/No, N/5, Skipped, or text.",
    ]));
    data.responses.forEach((response, respIndex) => {
        var _a, _b;
        const submittedIso = new Date(response.submittedAt).toISOString();
        const name = String((_a = response.userName) !== null && _a !== void 0 ? _a : "").trim() || "—";
        const email = String((_b = response.userEmail) !== null && _b !== void 0 ? _b : "").trim() || "—";
        const whoLine = `${name} | ${email} | ${submittedIso}`;
        rows.push(csvRow([
            "▼ START",
            `Submission ${respIndex + 1} of ${nSub} · ${whoLine}`,
            "",
            "",
            "",
            "",
            "",
            "",
        ]));
        const sorted = [...(response.answers || [])].sort((a, b) => {
            const ac = String(a.categoryCode || "").localeCompare(String(b.categoryCode || ""));
            if (ac !== 0)
                return ac;
            return (0, exports.compareQuestionCodes)(a.code, b.code);
        });
        sorted.forEach((ans, ansIndex) => {
            var _a, _b;
            const section = sectionTitleByCode.get(String(ans.categoryCode)) || ans.categoryTitle || ans.categoryCode || "";
            const qFull = String(ans.questionText || "")
                .replace(/\r?\n/g, " ")
                .trim();
            rows.push(csvRow([
                String(respIndex + 1),
                String(ansIndex + 1),
                ansIndex === 0 ? whoLine : "",
                String(section),
                String((_a = ans.code) !== null && _a !== void 0 ? _a : ""),
                qFull,
                String((_b = ans.answerType) !== null && _b !== void 0 ? _b : ""),
                (0, exports.answerToReadableString)(ans),
            ]));
        });
    });
    const body = rows.join("");
    return Buffer.from("\ufeff" + body, "utf8");
});
exports.generateAllResponsesCSV = generateAllResponsesCSV;
// PDF generation for survey summary
const generateSurveySummaryPDF = (survey, analytics) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const doc = new pdfkit_1.default({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Survey Summary - ${survey.title}`,
                Author: 'Survey System',
                Subject: 'Survey Analytics Report',
                CreationDate: new Date()
            },
            autoFirstPage: true,
            bufferPages: true
        });
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
        // Define colors
        const colors = {
            primary: '#2c3e50',
            secondary: '#34495e',
            success: '#27ae60',
            info: '#3498db',
            warning: '#f39c12',
            danger: '#e74c3c',
            muted: '#7f8c8d',
            light: '#ecf0f1'
        };
        // Title
        doc.fontSize(24).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Survey Analytics Report", { align: "center" });
        doc.fontSize(18).font("Helvetica")
            .fillColor(colors.secondary)
            .text(survey.title, { align: "center" });
        doc.moveDown(2);
        // Overview
        doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Overview");
        doc.fontSize(12).font("Helvetica")
            .fillColor(colors.secondary)
            .text(`Total Responses: ${analytics.totalResponses}`)
            .text(`Completion Rate: ${analytics.completionRate.toFixed(2)}%`)
            .text(`Survey Country: ${((_a = survey.country) === null || _a === void 0 ? void 0 : _a.name) || 'N/A'}`)
            .text(`Export Date: ${new Date().toLocaleString()}`);
        doc.moveDown(2);
        // Response Timeline
        if (Object.keys(analytics.responsesByDate).length > 0) {
            doc.fontSize(14).font("Helvetica-Bold")
                .fillColor(colors.primary)
                .text("Response Timeline");
            doc.moveDown();
            const timelineData = Object.entries(analytics.responsesByDate)
                .sort((a, b) => a[0].localeCompare(b[0]));
            // Create timeline chart
            const timelineChart = yield chartJSNodeCanvas.renderToBuffer({
                type: 'line',
                data: {
                    labels: timelineData.map(([date]) => date),
                    datasets: [{
                            label: 'Responses',
                            data: timelineData.map(([, count]) => count),
                            borderColor: colors.info,
                            backgroundColor: colors.info + '20',
                            fill: true,
                            tension: 0.1
                        }]
                },
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
            doc.image(timelineChart, { width: 400 });
            doc.moveDown(2);
        }
        // Question Statistics
        doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Question Statistics");
        doc.moveDown();
        for (const [code, stats] of Object.entries(analytics.questionStats)) {
            const questionStats = stats;
            // Check if we need a new page
            if (doc.y > doc.page.height - 250) {
                doc.addPage();
            }
            doc.fontSize(12).font("Helvetica-Bold")
                .fillColor(colors.secondary)
                .text(`${code}: ${questionStats.questionText.substring(0, 60)}${questionStats.questionText.length > 60 ? '...' : ''}`);
            doc.moveDown(0.5);
            doc.fontSize(10).font("Helvetica")
                .fillColor(colors.secondary);
            switch (questionStats.answerType) {
                case 'YesNo':
                    const yesCount = questionStats.stats.yes || 0;
                    const noCount = questionStats.stats.no || 0;
                    const total = yesCount + noCount;
                    if (total > 0) {
                        const yesPercentage = (yesCount / total) * 100;
                        const noPercentage = (noCount / total) * 100;
                        // Create pie chart
                        const yesNoChart = yield chartJSNodeCanvas.renderToBuffer({
                            type: 'doughnut',
                            data: {
                                labels: ['Yes', 'No'],
                                datasets: [{
                                        data: [yesCount, noCount],
                                        backgroundColor: [colors.success, colors.danger],
                                        borderWidth: 0
                                    }]
                            },
                            options: {
                                responsive: false,
                                plugins: {
                                    legend: {
                                        position: 'right'
                                    }
                                }
                            }
                        });
                        doc.image(yesNoChart, { width: 200, height: 150 });
                        doc.text(`Yes: ${yesCount} (${yesPercentage.toFixed(1)}%)`, doc.x + 210, doc.y - 150);
                        doc.text(`No: ${noCount} (${noPercentage.toFixed(1)}%)`, doc.x + 210, doc.y - 130);
                    }
                    else {
                        doc.text('No responses yet');
                    }
                    break;
                case 'Rating':
                    const avgRating = questionStats.stats.average || 0;
                    const distribution = questionStats.stats.distribution || [];
                    doc.text(`Average Rating: ${avgRating.toFixed(2)}/5`);
                    if (distribution.length > 0) {
                        // Create bar chart
                        const ratingChart = yield chartJSNodeCanvas.renderToBuffer({
                            type: 'bar',
                            data: {
                                labels: ['1', '2', '3', '4', '5'],
                                datasets: [{
                                        label: 'Responses',
                                        data: distribution.map((d) => d.count || 0),
                                        backgroundColor: colors.info,
                                        borderWidth: 0
                                    }]
                            },
                            options: {
                                responsive: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }
                        });
                        doc.image(ratingChart, { width: 250, height: 150 });
                    }
                    break;
                case 'MCQ':
                    const optionCounts = questionStats.stats.optionCounts || {};
                    const mcqData = Object.entries(optionCounts);
                    if (mcqData.length > 0) {
                        // Create horizontal bar chart for MCQ
                        const mcqChart = yield chartJSNodeCanvas.renderToBuffer({
                            type: 'bar',
                            data: {
                                labels: mcqData.map(([option]) => option),
                                datasets: [{
                                        label: 'Responses',
                                        data: mcqData.map(([, count]) => count),
                                        backgroundColor: [colors.info, colors.success, colors.warning, colors.danger, colors.primary],
                                        borderWidth: 0
                                    }]
                            },
                            options: {
                                indexAxis: 'y',
                                responsive: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    x: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }
                        });
                        doc.image(mcqChart, { width: 350, height: Math.min(mcqData.length * 40 + 50, 200) });
                    }
                    else {
                        doc.text('No responses yet');
                    }
                    break;
                case 'Text':
                    doc.text(`Total Responses: ${questionStats.stats.totalResponses || 0}`);
                    if (questionStats.stats.sampleResponses && questionStats.stats.sampleResponses.length > 0) {
                        doc.text('Sample Responses:');
                        questionStats.stats.sampleResponses.slice(0, 3).forEach((response) => {
                            doc.text(`  • "${response.substring(0, 50)}${response.length > 50 ? '...' : ''}"`);
                        });
                    }
                    break;
            }
            doc.moveDown(2);
        }
        // Key Population Statistics
        if (analytics.keyPopulationStats && Object.keys(analytics.keyPopulationStats).length > 0) {
            if (doc.y > doc.page.height - 200) {
                doc.addPage();
            }
            doc.fontSize(14).font("Helvetica-Bold")
                .fillColor(colors.primary)
                .text("Key Population Statistics");
            doc.moveDown();
            const populationData = Object.entries(analytics.keyPopulationStats);
            // Create pie chart for key populations
            const populationChart = yield chartJSNodeCanvas.renderToBuffer({
                type: 'pie',
                data: {
                    labels: populationData.map(([pop]) => pop),
                    datasets: [{
                            data: populationData.map(([, count]) => count),
                            backgroundColor: [colors.info, colors.success, colors.warning, colors.danger, colors.primary],
                            borderWidth: 0
                        }]
                },
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
            doc.image(populationChart, { width: 300, height: 200 });
        }
        // Add page numbers at the end
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).font("Helvetica")
                .fillColor(colors.muted)
                .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 30, { align: 'center', width: doc.page.width - 100 });
        }
        doc.end();
    }));
});
exports.generateSurveySummaryPDF = generateSurveySummaryPDF;
// CSV generation for survey summary
const generateSurveySummaryCSV = (survey, analytics) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const records = [];
    // Overview section
    records.push({ Section: 'Overview', Metric: 'Total Responses', Value: analytics.totalResponses }, { Section: 'Overview', Metric: 'Completion Rate', Value: `${analytics.completionRate.toFixed(2)}%` }, { Section: 'Overview', Metric: 'Survey Country', Value: ((_a = survey.country) === null || _a === void 0 ? void 0 : _a.name) || 'N/A' });
    // Response Timeline
    Object.entries(analytics.responsesByDate).forEach(([date, count]) => {
        records.push({ Section: 'Response Timeline', Metric: date, Value: count });
    });
    // Question Statistics
    Object.entries(analytics.questionStats).forEach(([code, stats]) => {
        records.push({ Section: 'Question Stats', Metric: `${code} - Question`, Value: stats.questionText });
        records.push({ Section: 'Question Stats', Metric: `${code} - Answer Type`, Value: stats.answerType });
        records.push({ Section: 'Question Stats', Metric: `${code} - Total Answers`, Value: stats.totalAnswers });
        switch (stats.answerType) {
            case 'YesNo':
                records.push({ Section: 'Question Stats', Metric: `${code} - Yes Count`, Value: stats.stats.yes }, { Section: 'Question Stats', Metric: `${code} - No Count`, Value: stats.stats.no }, { Section: 'Question Stats', Metric: `${code} - Yes Percentage`, Value: `${stats.stats.yesPercentage.toFixed(1)}%` });
                break;
            case 'Rating':
                records.push({ Section: 'Question Stats', Metric: `${code} - Average Rating`, Value: stats.stats.average.toFixed(2) });
                stats.stats.distribution.forEach((d) => {
                    records.push({ Section: 'Question Stats', Metric: `${code} - ${d.rating} Star Count`, Value: d.count });
                });
                break;
            case 'MCQ':
                Object.entries(stats.stats.optionCounts).forEach(([option, count]) => {
                    records.push({ Section: 'Question Stats', Metric: `${code} - ${option} Count`, Value: count });
                });
                break;
        }
    });
    const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({
        header: [
            { id: 'Section', title: 'Section' },
            { id: 'Metric', title: 'Metric' },
            { id: 'Value', title: 'Value' }
        ]
    });
    // Add metadata as comments
    const metadata = [
        `# Survey Summary Export`,
        `# Survey: ${survey.title}`,
        `# Country: ${((_b = survey.country) === null || _b === void 0 ? void 0 : _b.name) || 'N/A'}`,
        `# Total Responses: ${analytics.totalResponses}`,
        `# Export Date: ${new Date().toLocaleString()}`,
        `#`,
        ``
    ].join('\n');
    const csvString = metadata +
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records);
    return Buffer.from(csvString, 'utf-8');
});
exports.generateSurveySummaryCSV = generateSurveySummaryCSV;
