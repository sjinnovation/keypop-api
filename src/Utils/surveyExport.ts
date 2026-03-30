import PDFDocument from "pdfkit";
import { createObjectCsvStringifier } from "csv-writer";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

// Initialize chart renderer
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 400,
    height: 300,
    backgroundColour: 'white'
});

// PDF generation for single survey response
export const generateSurveyResponsePDF = async (data: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Survey Response - ${data.surveyTitle}`,
                Author: data.userName,
                Subject: 'Survey Response Report',
                CreationDate: new Date()
            }
        });

        const buffers: Buffer[] = [];

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
        data.categories.forEach((category: any, catIndex: number) => {
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
            const categoryAnswers = data.answers.filter(
                (a: any) => a.categoryCode === category.code
            );

            if (categoryAnswers.length === 0) {
                doc.fontSize(10).font("Helvetica-Oblique")
                    .fillColor(colors.muted)
                    .text("No responses in this category", 70);
                doc.moveDown();
                return;
            }

            // Process each answer
            categoryAnswers.forEach((answer: any, ansIndex: number) => {
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
            .text(
                `Generated on ${new Date().toLocaleString()}`,
                50,
                doc.page.height - 25,
                { align: 'center', width: doc.page.width - 100 }
            );

        // End the document
        doc.end();
    });
};

// CSV generation for single survey response
export const generateSurveyResponseCSV = async (data: any): Promise<Buffer> => {
    // Prepare records with all necessary information
    const records = data.answers.map((answer: any, index: number) => ({
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
    const csvStringifier = createObjectCsvStringifier({
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
};

// Alternative CSV format - Wide format (one row per response)
export const generateSurveyResponseCSVWide = async (data: any): Promise<Buffer> => {
    // Create a single row with all answers as columns
    const record: any = {
        'Respondent Name': data.userName,
        'Respondent Email': data.userEmail,
        'Survey Title': data.surveyTitle,
        'Survey Country': data.surveyCountry,
        'Submitted At': new Date(data.submittedAt).toLocaleString()
    };

    // Add each answer as a column
    data.answers.forEach((answer: any) => {
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

    const csvStringifier = createObjectCsvStringifier({ header: headers });
    const csvString = csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords([record]);

    return Buffer.from(csvString, 'utf-8');
};

// Helper function to create charts
const createChart = async (config: any): Promise<Buffer> => {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 200 });
    return await chartJSNodeCanvas.renderToBuffer(config);
};

// PDF generation for all responses
export const generateAllResponsesPDF = async (data: any): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `All Responses - ${data.survey.title}`,
                Author: 'Survey System',
                Subject: 'Survey Responses Report',
                CreationDate: new Date()
            }
        });

        const buffers: Buffer[] = [];

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

        // Title
        doc.fontSize(24).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("All Survey Responses", { align: "center" });
        doc.fontSize(18).font("Helvetica")
            .fillColor(colors.secondary)
            .text(data.survey.title, { align: "center" });
        doc.moveDown(2);

        // Overview
        doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Overview");
        doc.fontSize(12).font("Helvetica")
            .fillColor(colors.secondary)
            .text(`Total Responses: ${data.totalResponses}`)
            .text(`Survey Country: ${data.survey.country?.name || 'N/A'}`)
            .text(`Export Date: ${new Date().toLocaleString()}`);
        doc.moveDown(2);

        // Response timeline — text-only for large exports (chart is slow and often causes gateway timeouts)
        doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Response Timeline");
        doc.fontSize(10).font("Helvetica").fillColor(colors.secondary);
        const timelineData = Object.entries(data.responsesByDate).sort((a, b) => a[0].localeCompare(b[0]));
        const useChart =
            data.totalResponses <= 40 &&
            timelineData.length > 0 &&
            timelineData.length <= 20;
        if (useChart) {
            try {
                const timelineChart = await createChart({
                    type: 'line',
                    data: {
                        labels: timelineData.map(([date]) => date),
                        datasets: [{
                            label: 'Responses',
                            data: timelineData.map(([, count]) => count),
                            borderColor: colors.info,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
                doc.image(timelineChart, { width: 400 });
                doc.moveDown(1);
            } catch {
                timelineData.forEach(([date, count]) => {
                    doc.text(`  ${date}: ${count} response(s)`);
                });
            }
        } else {
            if (timelineData.length === 0) {
                doc.text("  No submissions by date.");
            } else {
                timelineData.forEach(([date, count]) => {
                    doc.text(`  ${date}: ${count} response(s)`);
                });
            }
            doc.moveDown(1);
        }
        doc.moveDown(1);

        // Response Summary
        doc.fontSize(14).font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text("Response Summary");
        doc.moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const tableHeaders = ['Response ID', 'User', 'Submitted At', 'Completion'];
        const columnWidth = (doc.page.width - 100) / tableHeaders.length;

        doc.fontSize(10).font("Helvetica-Bold");
        tableHeaders.forEach((header, i) => {
            doc.text(header, 50 + (i * columnWidth), tableTop, { width: columnWidth, align: 'center' });
        });
        doc.moveDown();

        // Table rows — use a fixed baseline Y per row (using doc.y per column stacked rows and blew up page count / timeouts)
        doc.fontSize(9).font("Helvetica");
        const qCount = Math.max(1, data.survey.questions?.length || 1);
        const rowGap = 16;
        const drawTableHeader = (y: number) => {
            doc.fontSize(10).font("Helvetica-Bold");
            tableHeaders.forEach((header, i) => {
                doc.text(header, 50 + (i * columnWidth), y, { width: columnWidth, align: 'center' });
            });
            doc.fontSize(9).font("Helvetica");
            return y + 22;
        };

        let y = doc.y + 4;
        y = drawTableHeader(y);

        data.responses.forEach((response: any, index: number) => {
            if (y > doc.page.height - 80) {
                doc.addPage();
                y = 50;
                y = drawTableHeader(y);
            }

            const completionRate = (response.answers.length / qCount) * 100;
            const rowTop = y;
            doc.text(`#${index + 1}`, 50, y, { width: columnWidth, align: 'center' });
            doc.text(String(response.userName ?? ''), 50 + columnWidth, y, { width: columnWidth, align: 'center' });
            doc.text(new Date(response.submittedAt).toLocaleString(), 50 + (2 * columnWidth), y, { width: columnWidth, align: 'center' });
            doc.text(`${completionRate.toFixed(1)}%`, 50 + (3 * columnWidth), y, { width: columnWidth, align: 'center' });

            y = rowTop + rowGap;
            doc.y = y;
        });

        // Footer
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).font("Helvetica")
                .fillColor(colors.muted)
                .text(
                    `Page ${i + 1} of ${pages.count}`,
                    50,
                    doc.page.height - 30,
                    { align: 'center', width: doc.page.width - 100 }
                );
        }

        doc.end();
    });
};

/** Normalize question text for CSV header (must match between header and row keys). */
const csvQuestionHeaderKey = (q: any): string => {
    const text = String(q?.text ?? '')
        .replace(/\r?\n/g, ' ')
        .replace(/"/g, '""')
        .trim();
    const truncated = text.length > 100 ? `${text.slice(0, 97)}...` : text;
    return `${q?.code ?? 'Q'}: ${truncated}`;
};

const csvCellFromAnswer = (answer: any): string => {
    if (!answer) return 'Not Answered';
    if (answer.formattedValue != null && String(answer.formattedValue).trim() !== '') {
        return String(answer.formattedValue);
    }
    const v = answer.value;
    if (v == null || v === '') return 'N/A';
    if (Array.isArray(v)) return v.join('; ');
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
};

// CSV generation for all responses
export const generateAllResponsesCSV = async (data: any): Promise<Buffer> => {
    const questions = Array.isArray(data.survey.questions) ? data.survey.questions : [];
    const qCount = Math.max(1, questions.length);
    // Prepare headers
    const staticHeaders = [
        'Response ID', 'User Name', 'User Email', 'Submitted At', 'Completion Rate'
    ];
    const questionHeaders = questions.map((q: any) => csvQuestionHeaderKey(q));
    const allHeaders = [...staticHeaders, ...questionHeaders];

    // Prepare records
    const records = data.responses.map((response: any, index: number) => {
        const record: any = {
            'Response ID': index + 1,
            'User Name': response.userName,
            'User Email': response.userEmail,
            'Submitted At': new Date(response.submittedAt).toLocaleString(),
            'Completion Rate': `${((response.answers.length / qCount) * 100).toFixed(1)}%`
        };

        questions.forEach((question: any) => {
            const answer = response.answers.find((a: any) => a.code === question.code);
            const headerKey = csvQuestionHeaderKey(question);
            record[headerKey] = csvCellFromAnswer(answer);
        });

        return record;
    });

    const csvStringifier = createObjectCsvStringifier({
        header: allHeaders.map(h => ({ id: h, title: h }))
    });

    // Add metadata as comments
    const metadata = [
        `# All Responses Export`,
        `# Survey: ${data.survey.title}`,
        `# Country: ${data.survey.country?.name || 'N/A'}`,
        `# Total Responses: ${data.totalResponses}`,
        `# Export Date: ${new Date().toLocaleString()}`,
        `#`,
        ``
    ].join('\n');

    const csvString = metadata +
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records);

    return Buffer.from(csvString, 'utf-8');
};

// PDF generation for survey summary
export const generateSurveySummaryPDF = async (survey: any, analytics: any): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({
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

        const buffers: Buffer[] = [];

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
            .text(`Survey Country: ${survey.country?.name || 'N/A'}`)
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
            const timelineChart = await chartJSNodeCanvas.renderToBuffer({
                type: 'line',
                data: {
                    labels: timelineData.map(([date]) => date),
                    datasets: [{
                        label: 'Responses',
                        data: timelineData.map(([, count]) => count as number),
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
            const questionStats = stats as any;

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
                        const yesNoChart = await chartJSNodeCanvas.renderToBuffer({
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
                    } else {
                        doc.text('No responses yet');
                    }
                    break;

                case 'Rating':
                    const avgRating = questionStats.stats.average || 0;
                    const distribution = questionStats.stats.distribution || [];

                    doc.text(`Average Rating: ${avgRating.toFixed(2)}/5`);

                    if (distribution.length > 0) {
                        // Create bar chart
                        const ratingChart = await chartJSNodeCanvas.renderToBuffer({
                            type: 'bar',
                            data: {
                                labels: ['1', '2', '3', '4', '5'],
                                datasets: [{
                                    label: 'Responses',
                                    data: distribution.map((d: any) => d.count || 0),
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
                        const mcqChart = await chartJSNodeCanvas.renderToBuffer({
                            type: 'bar',
                            data: {
                                labels: mcqData.map(([option]) => option),
                                datasets: [{
                                    label: 'Responses',
                                    data: mcqData.map(([, count]) => count as number),
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
                    } else {
                        doc.text('No responses yet');
                    }
                    break;

                case 'Text':
                    doc.text(`Total Responses: ${questionStats.stats.totalResponses || 0}`);
                    if (questionStats.stats.sampleResponses && questionStats.stats.sampleResponses.length > 0) {
                        doc.text('Sample Responses:');
                        questionStats.stats.sampleResponses.slice(0, 3).forEach((response: string) => {
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
            const populationChart = await chartJSNodeCanvas.renderToBuffer({
                type: 'pie',
                data: {
                    labels: populationData.map(([pop]) => pop),
                    datasets: [{
                        data: populationData.map(([, count]) => count as number),
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
                .text(
                    `Page ${i + 1} of ${pageCount}`,
                    50,
                    doc.page.height - 30,
                    { align: 'center', width: doc.page.width - 100 }
                );
        }

        doc.end();
    });
};

// CSV generation for survey summary
export const generateSurveySummaryCSV = async (survey: any, analytics: any): Promise<Buffer> => {
    const records: any[] = [];

    // Overview section
    records.push(
        { Section: 'Overview', Metric: 'Total Responses', Value: analytics.totalResponses },
        { Section: 'Overview', Metric: 'Completion Rate', Value: `${analytics.completionRate.toFixed(2)}%` },
        { Section: 'Overview', Metric: 'Survey Country', Value: survey.country?.name || 'N/A' }
    );

    // Response Timeline
    Object.entries(analytics.responsesByDate).forEach(([date, count]) => {
        records.push({ Section: 'Response Timeline', Metric: date, Value: count });
    });

    // Question Statistics
    Object.entries(analytics.questionStats).forEach(([code, stats]: [string, any]) => {
        records.push({ Section: 'Question Stats', Metric: `${code} - Question`, Value: stats.questionText });
        records.push({ Section: 'Question Stats', Metric: `${code} - Answer Type`, Value: stats.answerType });
        records.push({ Section: 'Question Stats', Metric: `${code} - Total Answers`, Value: stats.totalAnswers });

        switch (stats.answerType) {
            case 'YesNo':
                records.push(
                    { Section: 'Question Stats', Metric: `${code} - Yes Count`, Value: stats.stats.yes },
                    { Section: 'Question Stats', Metric: `${code} - No Count`, Value: stats.stats.no },
                    { Section: 'Question Stats', Metric: `${code} - Yes Percentage`, Value: `${stats.stats.yesPercentage.toFixed(1)}%` }
                );
                break;

            case 'Rating':
                records.push({ Section: 'Question Stats', Metric: `${code} - Average Rating`, Value: stats.stats.average.toFixed(2) });
                stats.stats.distribution.forEach((d: any) => {
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

    const csvStringifier = createObjectCsvStringifier({
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
        `# Country: ${survey.country?.name || 'N/A'}`,
        `# Total Responses: ${analytics.totalResponses}`,
        `# Export Date: ${new Date().toLocaleString()}`,
        `#`,
        ``
    ].join('\n');

    const csvString = metadata +
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records);

    return Buffer.from(csvString, 'utf-8');
};