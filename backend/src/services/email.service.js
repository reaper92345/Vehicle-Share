const nodemailer = require("nodemailer");

let cachedTransport = null;
let cachedPreviewUrl = null;

function formatNpr(amount) {
  const value = Number(amount) || 0;
  return `रु${value.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function invoiceNumber(bookingId) {
  return `INV-${String(bookingId).padStart(6, "0")}`;
}

function formatDate(value) {
  if (!value) return "—";
  const raw = value instanceof Date ? value.toISOString() : String(value);
  return raw.slice(0, 10);
}

function buildReceiptHtml(payload) {
  const {
    invoiceNo,
    issuedAt,
    equipmentTitle,
    equipmentImage,
    startDate,
    endDate,
    durationDays,
    totalPrice,
    ownerName,
    ownerEmail,
    ownerPhone,
    renterName,
    renterEmail,
    renterPhone,
    deploymentLocation,
    bookingId,
  } = payload;

  const imageBlock = equipmentImage
    ? `<img src="${equipmentImage}" alt="${equipmentTitle}" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;" />`
    : `<div style="height:120px;background:#e2e8f0;border-radius:12px;text-align:center;line-height:120px;color:#64748b;">No image</div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${invoiceNo} · EquipShare</title>
</head>
<body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#1d4ed8;color:#ffffff;padding:24px 28px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">EquipShare</p>
              <h1 style="margin:6px 0 0;font-size:24px;">Payment receipt</h1>
              <p style="margin:8px 0 0;font-size:14px;">Invoice ${invoiceNo} · ${issuedAt}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              ${imageBlock}
              <h2 style="margin:18px 0 4px;font-size:20px;">${equipmentTitle}</h2>
              <p style="margin:0;color:#64748b;font-size:14px;">Booking #${bookingId}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;font-size:14px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Rental period</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${startDate} → ${endDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Duration</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${durationDays} day${durationDays === 1 ? "" : "s"}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Deployment</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${deploymentLocation || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;font-weight:700;">Total paid (NPR)</td>
                  <td style="padding:12px 0;text-align:right;font-weight:700;color:#1d4ed8;font-size:18px;">${formatNpr(totalPrice)}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right:8px;">
                    <p style="margin:16px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Renter (Hire)</p>
                    <p style="margin:0;font-weight:700;">${renterName}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#475569;">${renterEmail || ""}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#475569;">${renterPhone || ""}</p>
                  </td>
                  <td width="50%" valign="top" style="padding-left:8px;">
                    <p style="margin:16px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Owner (Lister)</p>
                    <p style="margin:0;font-weight:700;">${ownerName}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#475569;">${ownerEmail || ""}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#475569;">${ownerPhone || ""}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This receipt was generated after QR payment confirmation on EquipShare. Keep it for your records.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
  return {
    invoiceNo,
    issuedAt: formatDate(new Date()),
    equipmentTitle: row.equipment_title,
    equipmentImage: row.image_url,
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    durationDays: durationDays(row.start_date, row.end_date),
    totalPrice: row.total_price,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerPhone: row.owner_phone,
    renterName: row.renter_name,
    renterEmail: row.renter_email,
    renterPhone: row.renter_phone,
    deploymentLocation: row.deployment_location || row.location,
    bookingId: row.id,
    html: null,
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
  const subject = `EquipShare receipt ${mapped.invoiceNo} — ${mapped.equipmentTitle}`;
  const to = bookingRow.renter_email;

  if (!to) {
    return { sent: false, reason: "missing_renter_email", invoiceNo: mapped.invoiceNo, html };
  }

  const transport = await getTransport();
  if (!transport) {
    console.log("[email.service] SMTP not configured. Receipt preview:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    return { sent: false, mode: "log", invoiceNo: mapped.invoiceNo, html };
  }

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || "EquipShare <receipts@equipshare.local>",
    to,
    cc: bookingRow.owner_email || undefined,
    subject,
    html,
    text: `${subject}\nTotal paid: ${formatNpr(mapped.totalPrice)}\n${mapped.startDate} to ${mapped.endDate}`,
  });

  cachedPreviewUrl = nodemailer.getTestMessageUrl(info) || cachedPreviewUrl;
  if (cachedPreviewUrl) {
    console.log("[email.service] Ethereal preview:", cachedPreviewUrl);
  }

  return {
    sent: true,
    invoiceNo: mapped.invoiceNo,
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
