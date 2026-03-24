

const { PDFDocument, StandardFonts } = require('pdf-lib');
const Bill = require('../models/Bill');

exports.generateBillPDF = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 750;

    // ===== HEADER =====
    page.drawText("SHREE CHINTAMANI ELECTRICALS", {
      x: 100,
      y,
      size: 16,
      font: bold,
    });

    y -= 30;

    // ===== BILL INFO =====
    page.drawText(`Bill No: ${bill.billNo}`, { x: 40, y, font });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 400, y, font });

    y -= 25;

    // ===== CUSTOMER =====
    const customerName = bill.customer?.name || "Walk-in Customer";
    const customerMobile = bill.customer?.mobile || "-";

    page.drawText(`Customer: ${customerName}`, { x: 40, y });
    y -= 20;
    page.drawText(`Mobile: ${customerMobile}`, { x: 40, y });

    y -= 30;

    // ===== TABLE HEADER =====
    page.drawText("No", { x: 40, y, font: bold });
    page.drawText("Item", { x: 80, y, font: bold });
    page.drawText("Qty", { x: 300, y, font: bold });
    page.drawText("Rate", { x: 350, y, font: bold });
    page.drawText("Amount", { x: 450, y, font: bold });

    y -= 20;

    // ===== ITEMS =====
    bill.items.forEach((item, index) => {
      page.drawText(String(index + 1), { x: 40, y });
      page.drawText(item.description || "-", { x: 80, y });
      page.drawText(String(item.qty || 0), { x: 300, y });
      page.drawText(String(item.rate || 0), { x: 350, y });
      page.drawText(String(item.amount || 0), { x: 450, y });

      y -= 20;
    });

    y -= 10;

    // ===== TOTAL =====
    page.drawText(`Total: Rs. ${bill.total}`, {
      x: 350,
      y,
      font: bold,
    });

    y -= 40;

    // ===== WARRANTY =====
    page.drawText("Warranty: 18 months", { x: 40, y });
    y -= 20;
    page.drawText("Replacement Charges: Rs. 800", { x: 40, y });

    y -= 40;

    // ===== SIGNATURE =====
    page.drawText("Authorized Signature", {
      x: 400,
      y,
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");

    res.send(pdfBytes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "PDF generation failed" });
  }
};