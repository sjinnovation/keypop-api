import PDFDocument from "pdfkit";
import { createObjectCsvStringifier } from "csv-writer";

// Helper function to format keys for display (e.g., phoneNumber -> Phone Number)
const formatHeader = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
};

// Helper function to get dynamic headers from tableData
const getDynamicHeaders = (tableData: any[]): string[] => {
  if (!tableData.length) return [];
  const firstRow = tableData[0];
  // Exclude internal fields like __v and _id (optional: adjust as needed)
  return Object.keys(firstRow).filter(
    (key) => !["__v", "_id"].includes(key)
  );
};

// Helper function to calculate dynamic column widths based on headers
const getDynamicColumnWidths = (headers: string[], pageWidth: number): number[] => {
  const totalWidth = pageWidth - 100; // Account for margins (50 each side)
  const baseWidth = totalWidth / headers.length;
  return headers.map(() => Math.max(80, Math.min(baseWidth, 150))); // Min 80, max 150
};

export const generatePDF = async (tableData: any[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
      autoFirstPage: false
    });
    const buffers: Buffer[] = [];
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
};

export const generateCSV = async (tableData: any[]): Promise<Buffer> => {
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

  const csvStringifier = createObjectCsvStringifier({
    header: csvHeaders,
  });

  // Map tableData to CSV records
  const records = tableData.map((row) =>
    headers.reduce((acc, key) => {
      let value = row[key] || "";
      if (key.includes("At") && value) {
        value = new Date(value).toLocaleString(); // Format dates
      }
      return { ...acc, [key]: value };
    }, {})
  );

  const csvString =
    csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  return Buffer.from(csvString);
};