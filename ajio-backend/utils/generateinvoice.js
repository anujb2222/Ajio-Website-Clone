const PDFDocument = require("pdfkit");

const generateInvoiceBuffer = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const primary = "#000000";
    const gray = "#666666";
    const lightGray = "#f0f0f0";
    const accent = "#e91e63";
    const border = "#dddddd";

    const GST_RATE = 0.18;

    const invoiceDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const invoiceNo = `INV-${Math.floor(
      10000000 + Math.random() * 90000000
    )}`;

    
    doc.fillColor(primary).fontSize(30).font("Helvetica-Bold")
      .text("AJIO", 40, 50);

    doc.fillColor(gray).fontSize(10).font("Helvetica")
      .text("by AJIO ", 40, 85);

    doc.fillColor(primary).fontSize(20).font("Helvetica-Bold")
      .text("TAX INVOICE", 350, 50, { align: "right" });

    doc.fontSize(9).font("Helvetica").fillColor(gray)
      .text(`Invoice No: ${invoiceNo}`, 350, 75, { align: "right" });

    doc.text(`Date: ${invoiceDate}`, 350, 88, { align: "right" });

    doc.moveTo(40, 110).lineTo(555, 110).strokeColor(primary).stroke();


    const boxTop = 130;
    doc.strokeColor(border).rect(40, boxTop, 515, 90).stroke();
    doc.moveTo(297, boxTop).lineTo(297, boxTop + 90).stroke();

  
    doc.fillColor(gray).fontSize(8).font("Helvetica-Bold")
      .text("STORE DETAILS", 55, boxTop + 12);

    doc.fillColor(primary).fontSize(10).font("Helvetica-Bold")
      .text("AJIO Clone Fashion Ltd", 55, boxTop + 28);

    doc.fillColor(gray).font("Helvetica").fontSize(9)
      .text("Bangalore, Karnataka - 560001", 55, boxTop + 58)
      .text("GSTIN: 29ABCDE1234F1Z5", 55, boxTop + 71);

   
    doc.fillColor(gray).fontSize(8).font("Helvetica-Bold")
      .text("BILL TO", 312, boxTop + 12);

    doc.fillColor(primary).fontSize(10).font("Helvetica-Bold")
      .text(data.name || "Customer", 312, boxTop + 28);

    doc.fillColor(gray).font("Helvetica").fontSize(9)
      .text(data.email, 312, boxTop + 45, { width: 220 });

    doc.fillColor(accent).font("Helvetica-Bold")
      .text("PAID ONLINE", 312, boxTop + 65);

    const summaryTop = boxTop + 110;

    doc.fillColor(lightGray).rect(40, summaryTop, 515, 45).fill();

    doc.fillColor(accent).fontSize(9).font("Helvetica-Bold")
      .text("ORDER SUMMARY", 55, summaryTop + 12);

    const mainItemName =
      data.items?.[0]?.productId?.itemName || "Product Purchase";

    doc.fillColor(primary).fontSize(16).font("Helvetica-Bold")
      .text(mainItemName, 55, summaryTop + 25);

    
    const tableTop = summaryTop + 70;

    doc.moveTo(40, tableTop).lineTo(555, tableTop).stroke();

    doc.fontSize(9).font("Helvetica-Bold").fillColor(primary)
      .text("DESCRIPTION", 55, tableTop + 10)
      .text("QTY", 400, tableTop + 10, { width: 30, align: "right" })
      .text("RATE", 440, tableTop + 10, { width: 50, align: "right" })
      .text("AMOUNT", 500, tableTop + 10, { width: 50, align: "right" });

    doc.moveTo(40, tableTop + 25).lineTo(555, tableTop + 25).stroke();

    let y = tableTop + 35;
    let totalBase = 0;
    let grandTotal = 0;

    data.items.forEach((item) => {
      const product = item.productId;
      const qty = item.quantity;
      const price = product?.itemPrice || 0;
      const name = product?.itemName || "Item";

      const base = price / (1 + GST_RATE);
      const lineBase = base * qty;
      const lineTotal = price * qty;

      totalBase += lineBase;
      grandTotal += lineTotal;

      doc.font("Helvetica").fontSize(9).fillColor(primary)
        .text(name, 55, y, { width: 330 })
        .text(qty.toString(), 400, y, { width: 30, align: "right" })
        .text(`Rs. ${base.toFixed(2)}`, 440, y, { width: 50, align: "right" })
        .text(`Rs. ${lineBase.toFixed(2)}`, 500, y, { width: 50, align: "right" });

      y += 20;
    });

    const gst = grandTotal - totalBase;
    const cgst = gst / 2;
    const sgst = gst / 2;

    doc.text("CGST @ 9%", 55, y)
      .text(`Rs. ${cgst.toFixed(2)}`, 500, y, { align: "right" });

    y += 20;

    doc.text("SGST @ 9%", 55, y)
      .text(`Rs. ${sgst.toFixed(2)}`, 500, y, { align: "right" });

    y += 20;

    doc.moveTo(40, y).lineTo(555, y).stroke();

    y += 15;

    doc.fontSize(14).font("Helvetica-Bold")
      .text("TOTAL AMOUNT", 55, y);

    doc.fillColor(accent).fontSize(18).text(
      `Rs. ${grandTotal.toFixed(2)}`,
      450,
      y,
      { align: "right" }
    );

    doc.end();
  });
};

module.exports = { generateInvoiceBuffer };