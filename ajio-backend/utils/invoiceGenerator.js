const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


const generateInvoice = (orderData) => {
  const doc = new PDFDocument();


  const filename = `Invoice-${orderData.razorpayOrderId}.pdf`;
 const filePath = path.join(__dirname, '..', 'invoices', filename);


  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text('AJIO Clone Store', { align: 'center' });
  doc.fontSize(12).text('Address: 123, State', { align: 'center' });
  doc.moveDown();
  doc.text(`Invoice for Order ID: ${orderData.razorpayOrderId}`, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();


  doc.text(`Customer Email: ${orderData.email}`, { align: 'left' });
  doc.moveDown();

 
  doc.text('Items Ordered:', { align: 'left' });
  orderData.items.forEach(item => {
    doc.text(`${item.productName} - ₹${item.price} x ${item.quantity}`);
  });
  doc.moveDown();

  doc.text(`Total Price: ₹${orderData.totalPrice}`, { align: 'left' });
  doc.moveDown();


  doc.text('Thank you for shopping with us!', { align: 'center' });


  doc.end();

  return filePath;
};

module.exports = { generateInvoice };