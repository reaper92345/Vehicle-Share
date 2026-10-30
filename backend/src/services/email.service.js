const nodemailer = require("nodemailer");

let cachedTransport = null;
let cachedPreviewUrl = null;

function formatNpr(amount) {
  const value = Number(amount) || 0;
  return `रु ${value.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function invoiceNumber(bookingId) {
  return `INV-${String(bookingId).padStart(6, "0")}`;
}

function transactionId(bookingId) {
  const hex = Number(bookingId * 987654321).toString(16).toUpperCase().padStart(10, "0");
  return `TXN-${hex}`;
}

function formatDate(value) {
  if (!value) return "—";
  const raw = value instanceof Date ? value.toISOString() : String(value);
  return raw.slice(0, 10);
}

// Convert NPR number into formal English words
function numberToWords(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertSection(n) {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + " ";
    }
    return str;
  }

  let words = "";
  let n = num;

  if (n >= 10000000) {
    words += convertSection(Math.floor(n / 10000000)) + "Crore ";
    n %= 10000000;
  }
  if (n >= 100000) {
    words += convertSection(Math.floor(n / 100000)) + "Lakh ";
    n %= 100000;
  }
  if (n >= 1000) {
    words += convertSection(Math.floor(n / 1000)) + "Thousand ";
    n %= 1000;
  }
  if (n > 0) {
    words += convertSection(n);
  }

  return `${words.trim()} Nepalese Rupees Only`;
}

// High-fidelity Classic Black & White Tax Invoice / Receipt Template
function buildReceiptHtml(payload) {
  const {
    invoiceNo,
    txnId,
    issuedAt,
    equipmentTitle,
    startDate,
    endDate,
    durationDays,
    dailyRate,
    totalPrice,
    taxableAmount,
    vatAmount,
    amountWords,
    ownerName,
    ownerEmail,
    ownerPhone,
    renterName,
    renterEmail,
    renterPhone,
    deploymentLocation,
    bookingId,
  } = payload;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${invoiceNo} · TAX INVOICE · EquipShare</title>
  <style>
    body {
      margin: 0;
      padding: 30px 15px;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #000000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .invoice-box {
        border: 2px solid #000000 !important;
        box-shadow: none !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      .no-print {
        display: none !important;
      }
    }
    table {
      border-collapse: collapse;
    }
    .invoice-box {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #000000;
      padding: 32px 36px;
      box-sizing: border-box;
    }
    .header-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0;
    }
    .header-sub {
      font-size: 13px;
      font-weight: bold;
      margin: 4px 0 0 0;
    }
    .header-address {
      font-size: 11px;
      line-height: 1.4;
      margin: 4px 0 0 0;
    }
    .tax-badge {
      border: 2px solid #000000;
      padding: 8px 12px;
      text-align: right;
      display: inline-block;
    }
    .meta-bar {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      padding: 8px 0;
      margin: 18px 0;
      font-size: 11px;
    }
    .parties-table {
      width: 100%;
      margin-bottom: 20px;
      font-size: 11px;
    }
    .parties-col {
      width: 50%;
      vertical-align: top;
      padding: 8px 12px;
      border: 1px solid #000000;
    }
    .items-table {
      width: 100%;
      font-size: 11px;
      border: 1px solid #000000;
      margin-bottom: 16px;
    }
    .items-table th {
      background: #ffffff;
      border-bottom: 2px solid #000000;
      border-right: 1px solid #000000;
      padding: 8px 10px;
      text-align: left;
      font-weight: 800;
      text-transform: uppercase;
    }
    .items-table td {
      border-bottom: 1px solid #000000;
      border-right: 1px solid #000000;
      padding: 10px;
      vertical-align: top;
    }
    .items-table th:last-child, .items-table td:last-child {
      border-right: none;
    }
    .calc-table {
      width: 100%;
      font-size: 11px;
      border-collapse: collapse;
    }
    .calc-table td {
      padding: 4px 0;
    }
    .total-row td {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      padding: 8px 0;
      font-weight: 900;
      font-size: 14px;
    }
    .words-box {
      border: 1px solid #000000;
      padding: 10px 12px;
      font-size: 11px;
      background: #ffffff;
      margin-bottom: 12px;
    }
    .stamp-box {
      border: 2px solid #000000;
      width: 130px;
      height: 60px;
      text-align: center;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }
    .print-btn {
      background: #000000;
      color: #ffffff;
      padding: 8px 18px;
      border: none;
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>

  <div class="no-print" style="max-width: 760px; margin: 0 auto 12px auto; display: flex; justify-content: space-between; align-items: center;">
    <button onclick="window.print()" class="print-btn">🖨️ Print / Save as PDF</button>
    <span style="font-size: 11px; color: #475569;">Official Black & White IRD Tax Invoice</span>
  </div>

  <div class="invoice-box">
    
    <!-- Top Header -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="top" style="width: 60%;">
          <h1 class="header-title">EQUIPSHARE</h1>
          <p class="header-sub">EquipShare Marketplace Nepal Pvt. Ltd.</p>
          <p class="header-address">
            Jagati-7, Bhaktapur, Bagmati Province, Nepal<br/>
            Tel: +977-1-6612345 | Web: www.equipshare.com<br/>
            Email: billing@equipshare.com
          </p>
        </td>
        <td valign="top" align="right" style="width: 40%;">
          <div class="tax-badge">
            <div style="font-size: 14px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;">
              TAX INVOICE
            </div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 2px;">
              कर बिजक
            </div>
            <div style="font-size: 13px; font-weight: 900; border-top: 1px solid #000; margin-top: 6px; padding-top: 4px;">
              PAN / VAT: 610394821
            </div>
            <div style="font-size: 10px; margin-top: 2px;">
              Company Reg: 284910/080/081
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Metadata Strip -->
    <div class="meta-bar">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td><strong>Invoice No:</strong> ${invoiceNo}</td>
          <td><strong>Issue Date:</strong> ${issuedAt}</td>
          <td><strong>Payment:</strong> PAID (QR/Fonepay)</td>
          <td align="right"><strong>Txn Ref:</strong> ${txnId}</td>
        </tr>
      </table>
    </div>

    <!-- Parties Details -->
    <table class="parties-table" cellpadding="0" cellspacing="0">
      <tr>
        <td class="parties-col" style="border-right: none;">
          <div style="font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">
            BILLED TO (HIRE CUSTOMER / RENTER):
          </div>
          <div style="font-size: 13px; font-weight: 800;">${renterName || "Valued Customer"}</div>
          <div style="margin-top: 4px; line-height: 1.5;">
            <strong>Email:</strong> ${renterEmail || "—"}<br/>
            <strong>Contact:</strong> ${renterPhone || "—"}<br/>
            <strong>Project Site:</strong> ${deploymentLocation || "Confirmed Project Site"}<br/>
            <strong>Buyer PAN:</strong> Consumer / Unregistered
          </div>
        </td>
        <td class="parties-col">
          <div style="font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">
            ON BEHALF OF (EQUIPMENT OWNER):
          </div>
          <div style="font-size: 13px; font-weight: 800;">${ownerName || "EquipShare Verified Host"}</div>
          <div style="margin-top: 4px; line-height: 1.5;">
            <strong>Email:</strong> ${ownerEmail || "—"}<br/>
            <strong>Contact:</strong> ${ownerPhone || "—"}<br/>
            <strong>Booking Ref:</strong> #ES-${bookingId}<br/>
            <strong>Depot:</strong> Jagati, Bhaktapur
          </div>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table class="items-table" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">S.N.</th>
          <th style="width: 48%;">Description of Machinery / Service</th>
          <th style="width: 12%; text-align: center;">Duration</th>
          <th style="width: 17%; text-align: right;">Daily Rate</th>
          <th style="width: 18%; text-align: right;">Gross Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center;">1</td>
          <td>
            <div style="font-size: 13px; font-weight: 900;">${equipmentTitle}</div>
            <div style="font-size: 10px; margin-top: 3px;">
              Rental Period: ${startDate} to ${endDate} (${durationDays} Days)<br/>
              Operational Deployment: ${deploymentLocation || "Verified Jobsite"}
            </div>
          </td>
          <td style="text-align: center;">
            ${durationDays} Day${durationDays === 1 ? "" : "s"}
          </td>
          <td style="text-align: right;">
            ${formatNpr(dailyRate)}
          </td>
          <td style="text-align: right; font-weight: 800;">
            ${formatNpr(totalPrice)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Calculation Summary & Words -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td width="55%" valign="top" style="padding-right: 20px;">
          <div class="words-box">
            <div style="font-weight: 900; text-transform: uppercase; font-size: 10px; margin-bottom: 3px;">
              Amount in Words (अक्षरूपी):
            </div>
            <div style="font-style: italic; font-weight: 700;">
              "${amountWords}"
            </div>
          </div>
          <div style="font-size: 10px; line-height: 1.4; border: 1px dashed #000; padding: 6px 10px;">
            <strong>Declaration:</strong> Certified that this invoice reflects the actual hire fee charged for the equipment specified. Goods and services tax calculated in accordance with the Nepal Value Added Tax (VAT) Act, 2052.
          </div>
        </td>
        <td width="45%" valign="top">
          <table class="calc-table">
            <tr>
              <td>Taxable Amount (करयोग्य रकम):</td>
              <td align="right" style="font-weight: 700;">${formatNpr(taxableAmount)}</td>
            </tr>
            <tr>
              <td>13% VAT (मू.अ.कर १३%):</td>
              <td align="right" style="font-weight: 700;">${formatNpr(vatAmount)}</td>
            </tr>
            <tr>
              <td>Non-Taxable Amount / Deposit:</td>
              <td align="right">रु 0.00</td>
            </tr>
            <tr class="total-row">
              <td>Grand Total (कुल जम्मा):</td>
              <td align="right">${formatNpr(totalPrice)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Bottom Signatures & Seal -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #000; padding-top: 14px;">
      <tr>
        <td width="60%" valign="bottom">
          <p style="font-size: 9px; line-height: 1.4; margin: 0;">
            This is a computer-generated commercial tax invoice recognized under Nepal IRD rules.<br/>
            EquipShare Marketplace Nepal Pvt. Ltd. · Jagati-7, Bhaktapur
          </p>
        </td>
        <td width="40%" align="right" valign="bottom">
          <div style="text-align: center; display: inline-block;">
            <div class="stamp-box">
              <span>★ EQUIPSHARE ★</span>
              <span style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 1px 0; margin: 2px 0;">PAID & VERIFIED</span>
              <span>BHAKTAPUR</span>
            </div>
            <div style="border-top: 1px solid #000; margin-top: 8px; padding-top: 4px; font-size: 10px; font-weight: 800;">
              Authorized Billing Signatory
            </div>
          </div>
        </td>
      </tr>
    </table>

  </div>

</body>
</html>`;
}

function durationDays(startDate, endDate) {
  const start = new Date(`${formatDate(startDate)}T00:00:00.000Z`);
  const end = new Date(`${formatDate(endDate)}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 1;
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function mapBookingToReceipt(row) {
  const invoiceNo = invoiceNumber(row.id);
  const txnId = transactionId(row.id);
  const days = durationDays(row.start_date, row.end_date);
  const grossTotal = Number(row.total_price) || 0;

  // 13% VAT calculation formula: Gross = Taxable * 1.13
  const taxableAmount = Math.round((grossTotal / 1.13) * 100) / 100;
  const vatAmount = Math.round((grossTotal - taxableAmount) * 100) / 100;
  const dailyRate = Math.round((grossTotal / days) * 100) / 100;

  return {
    invoiceNo,
    txnId,
    issuedAt: formatDate(new Date()),
    equipmentTitle: row.equipment_title,
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    durationDays: days,
    dailyRate,
    totalPrice: grossTotal,
    taxableAmount,
    vatAmount,
    amountWords: numberToWords(grossTotal),
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerPhone: row.owner_phone,
    renterName: row.renter_name,
    renterEmail: row.renter_email,
    renterPhone: row.renter_phone,
    deploymentLocation: row.deployment_location || row.location,
    bookingId: row.id,
  };
}

async function getTransport() {
  if (cachedTransport) return cachedTransport;

  if (process.env.SMTP_HOST) {
    cachedTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    return cachedTransport;
  }

  if (process.env.EMAIL_MODE === "ethereal") {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return cachedTransport;
  }

  return null;
}

async function sendPaymentReceiptEmail(bookingRow) {
  const mapped = mapBookingToReceipt(bookingRow);
  const html = buildReceiptHtml(mapped);
  const subject = `TAX INVOICE ${mapped.invoiceNo} · EquipShare [PAN: 610394821] — ${mapped.equipmentTitle}`;
  const to = bookingRow.renter_email;

  if (!to) {
    return { sent: false, reason: "missing_renter_email", invoiceNo: mapped.invoiceNo, html };
  }

  const transport = await getTransport();
  if (!transport) {
    console.log("[email.service] SMTP not configured. Tax invoice preview:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    return { sent: false, mode: "log", invoiceNo: mapped.invoiceNo, txnId: mapped.txnId, html };
  }

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || '"EquipShare Billing" <billing@equipshare.com>',
    to,
    cc: bookingRow.owner_email || undefined,
    subject,
    html,
    text: `${subject}\nTotal Paid: ${formatNpr(mapped.totalPrice)}\nTaxable: ${formatNpr(mapped.taxableAmount)} | VAT (13%): ${formatNpr(mapped.vatAmount)}\n${mapped.startDate} to ${mapped.endDate}`,
  });

  cachedPreviewUrl = nodemailer.getTestMessageUrl(info) || cachedPreviewUrl;
  if (cachedPreviewUrl) {
    console.log("[email.service] Ethereal preview:", cachedPreviewUrl);
  }

  return {
    sent: true,
    invoiceNo: mapped.invoiceNo,
    txnId: mapped.txnId,
    messageId: info.messageId,
    previewUrl: cachedPreviewUrl || undefined,
    html,
  };
}

function renderReceiptHtml(bookingRow) {
  return buildReceiptHtml(mapBookingToReceipt(bookingRow));
}

module.exports = {
  sendPaymentReceiptEmail,
  renderReceiptHtml,
  invoiceNumber,
};
