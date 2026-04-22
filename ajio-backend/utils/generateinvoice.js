const PDFDocument = require("pdfkit");

const generateInvoiceBuffer = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    const primary = "#000000";
    const gray = "#666666";
    const accent = "#e91e63";

    const invoiceDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const invoiceNo = `INV-${Math.floor(
      10000000 + Math.random() * 90000000
    )}`;

    // HEADER
    doc.fillColor(primary).fontSize(28).text("AJIO", 40, 50);

    doc
      .fontSize(16)
      .text("TAX INVOICE", 350, 50, { align: "right" });

    doc
      .fontSize(9)
      .fillColor(gray)
      .text(`Invoice No: ${invoiceNo}`, 350, 75, { align: "right" })
      .text(`Date: ${invoiceDate}`, 350, 90, { align: "right" });

    doc.moveTo(40, 110).lineTo(555, 110).stroke();

    // CUSTOMER
    doc
      .fillColor(primary)
      .fontSize(12)
      .text("BILL TO", 40, 130);

    doc
      .fontSize(10)
      .fillColor(gray)
      .text(data.name || "Customer", 40, 150)
      .text(data.email || "", 40, 165);

    doc.fillColor(accent).text("PAID ONLINE", 40, 180);

    // ITEMS
    let y = 220;
    let total = 0;

    doc.fillColor(primary).fontSize(10).text("ITEMS", 40, y);
    y += 20;

    data.items.forEach((item) => {
      const name = item.productId?.itemName || "Item";
      const price = item.productId?.itemPrice || 0;
      const qty = item.quantity;
      const lineTotal = price * qty;

      total += lineTotal;

      doc
        .fontSize(10)
        .fillColor(primary)
        .text(name, 40, y)
        .text(`Qty: ${qty}`, 300, y)
        .text(`Rs ${lineTotal}`, 420, y);

      y += 20;
    });

    // TOTAL
    doc
      .moveTo(40, y + 10)
      .lineTo(555, y + 10)
      .stroke();

    doc
      .fontSize(14)
      .fillColor(accent)
      .text(`TOTAL: Rs ${total}`, 400, y + 25);

    doc.end();
  });
};

module.exports = { generateInvoiceBuffer };