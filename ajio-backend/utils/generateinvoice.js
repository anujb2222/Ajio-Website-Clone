const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateInvoice = (data, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const primary = "#000000";
    const gray = "#666666";
    const lightGray = "#f0f0f0";
    const accent = "#e91e63"; // Pinkish-red color from sample
    const border = "#dddddd";

    const GST_RATE = 0.18;
    const invoiceDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    const invoiceNo = `INV-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // ===== HEADER =====
    doc.fillColor(primary).fontSize(30).font("Helvetica-Bold")
      .text("AJIO", 40, 50);
    doc.fillColor(gray).fontSize(10).font("Helvetica")
      .text("by AJIO Clone", 40, 85);

    doc.fillColor(primary).fontSize(20).font("Helvetica-Bold")
      .text("TAX INVOICE", 350, 50, { align: "right" });
    doc.fontSize(9).font("Helvetica").fillColor(gray)
      .text(`Invoice No: ${invoiceNo}`, 350, 75, { align: "right" });
    doc.text(`Date: ${invoiceDate}`, 350, 88, { align: "right" });

    doc.moveTo(40, 110).lineTo(555, 110).strokeColor(primary).lineWidth(1).stroke();

    // ===== SELLER / BUYER BOX =====
    const boxTop = 130;
    doc.strokeColor(border).rect(40, boxTop, 515, 90).stroke();
    doc.moveTo(297, boxTop).lineTo(297, boxTop + 90).strokeColor(border).stroke();

    // Seller (Store Details)
    doc.fillColor(gray).fontSize(8).font("Helvetica-Bold")
      .text("STORE DETAILS", 55, boxTop + 12);
    doc.fillColor(primary).fontSize(10).font("Helvetica-Bold")
      .text("AJIO Clone Fashion Ltd", 55, boxTop + 28);
    doc.fillColor(gray).font("Helvetica").fontSize(9)
      .text("123 Fashion Street, Cyber City", 55, boxTop + 45)
      .text("Bangalore, Karnataka - 560001", 55, boxTop + 58)
      .text("GSTIN: 29ABCDE1234F1Z5", 55, boxTop + 71);

    // Buyer (Bill To)
    doc.fillColor(gray).fontSize(8).font("Helvetica-Bold")
      .text("BILL TO", 312, boxTop + 12);
    doc.fillColor(primary).fontSize(10).font("Helvetica-Bold")
      .text(data.name || "Customer", 312, boxTop + 28);
    doc.fillColor(gray).font("Helvetica").fontSize(9)
      .text(data.email, 312, boxTop + 45, { width: 220 })
      .fillColor(accent).font("Helvetica-Bold")
      .text("PAID ONLINE", 312, boxTop + 65);

    // ===== ORDER SUMMARY HEADER =====
    const summaryTop = boxTop + 110;
    doc.fillColor(lightGray).rect(40, summaryTop, 515, 45).fill();
    doc.fillColor(accent).fontSize(9).font("Helvetica-Bold")
      .text("ORDER SUMMARY", 55, summaryTop + 12);
    
    // Using the first item for the summary title as per sample style
    const mainItemName = data.items[0]?.productId?.itemName || "Product Purchase";
    doc.fillColor(primary).fontSize(16).font("Helvetica-Bold")
      .text(mainItemName, 55, summaryTop + 25);

    // ===== TABLE HEADER =====
    const tableTop = summaryTop + 70;
    doc.moveTo(40, tableTop).lineTo(555, tableTop).strokeColor(primary).lineWidth(1).stroke();
    
    doc.fillColor(primary).fontSize(9).font("Helvetica-Bold");
    doc.text("DESCRIPTION", 55, tableTop + 10);
    doc.text("QTY", 400, tableTop + 10, { width: 30, align: "right" });
    doc.text("RATE", 440, tableTop + 10, { width: 50, align: "right" });
    doc.text("AMOUNT", 500, tableTop + 10, { width: 50, align: "right" });

    doc.moveTo(40, tableTop + 25).lineTo(555, tableTop + 25).strokeColor(primary).lineWidth(1).stroke();

    let y = tableTop + 35;
    let totalBase = 0;
    let grandTotal = 0;

    // ===== ITEMS =====
    data.items.forEach((item) => {
      const product = item.productId;
      const qty = item.quantity;
      const price = product?.itemPrice || 0;
      const name = product?.itemName || "Unknown Item";

      const base = price / (1 + GST_RATE);
      const lineBase = base * qty;
      const lineTotal = price * qty;

      totalBase += lineBase;
      grandTotal += lineTotal;

      doc.fillColor(primary).font("Helvetica").fontSize(9);
      doc.text(name, 55, y, { width: 330 });
      doc.text(qty.toString(), 400, y, { width: 30, align: "right" });
      doc.text(`Rs. ${base.toFixed(2)}`, 440, y, { width: 50, align: "right" });
      doc.text(`Rs. ${lineBase.toFixed(2)}`, 500, y, { width: 50, align: "right" });

      y += 20;
    });

    const gst = grandTotal - totalBase;
    const cgst = gst / 2;
    const sgst = gst / 2;

    // CGST Row
    doc.text("CGST @ 9%", 55, y);
    doc.text(`Rs. ${cgst.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 20;

    // SGST Row
    doc.text("SGST @ 9%", 55, y);
    doc.text(`Rs. ${sgst.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 15;

    doc.moveTo(40, y).lineTo(555, y).strokeColor(primary).lineWidth(1.5).stroke();
    y += 15;

    // ===== TOTAL SECTION =====
    doc.fillColor(primary).font("Helvetica-Bold").fontSize(14)
      .text("TOTAL AMOUNT", 55, y);
    doc.fontSize(8).font("Helvetica").fillColor(gray)
      .text("(inclusive of all taxes)", 55, y + 15);
    
    doc.fillColor(accent).fontSize(18).font("Helvetica-Bold")
      .text(`Rs. ${grandTotal.toFixed(2)}`, 450, y, { width: 100, align: "right" });

    y += 50;

    // ===== PAYMENT DETAILS =====
    // doc.fillColor(primary).fontSize(9).font("Helvetica-Bold")
    //   .text("PAYMENT DETAILS", 55, y);
    // doc.moveTo(55, y + 12).lineTo(150, y + 12).strokeColor(border).lineWidth(0.5).stroke();
    
    // y += 20;
    // doc.fillColor(gray).fontSize(8).font("Helvetica")
    //   .text(`Order ID: ${data.orderId || "N/A"}`, 55, y)
    //   .text(`Payment ID: ${data.paymentId || "N/A"}`, 55, y + 12);

    // ===== FOOTER =====
    doc.fillColor(gray).fontSize(8).font("Helvetica")
      .text(
        "This is a computer-generated GST invoice. No signature required.",
        40,
        780,
        { align: "center", width: 515 }
      );

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = { generateInvoice };
