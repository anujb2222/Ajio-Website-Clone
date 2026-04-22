const PDFDocument = require('pdfkit');


const generateInvoice = (orderData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];

  
    doc.on('data', buffers.push.bind(buffers));
    
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.on('error', (err) => {
      reject(err);
    });


    doc.fillColor('#2d2d2d').fontSize(20).text('AJIO CLONE STORE', { align: 'center' });
    doc.fontSize(10).text('123, Ecommerce Plaza, Digital Way', { align: 'center' });
    doc.moveDown();
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); 
    doc.moveDown();

    doc.fontSize(12).fillColor('black');
    doc.text(`Invoice for Order ID: ${orderData.razorpayOrderId || 'N/A'}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer Email: ${orderData.email}`);
    doc.moveDown();

    doc.text('Items Ordered:', { underline: true });
    doc.moveDown(0.5);

    orderData.items.forEach(item => {
      doc.text(`${item.productName} - ₹${item.price} x ${item.quantity}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Price: ₹${orderData.totalPrice}`, { bold: true });
    
    doc.moveDown(2);
    doc.fontSize(10).fillColor('grey').text('Thank you for shopping with us!', { align: 'center' });

   
    doc.end();
  });
};

module.exports = { generateInvoice };