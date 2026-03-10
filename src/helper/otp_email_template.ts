interface BuildOtpEmailTemplateParams {
  otp: string;
  recipientName?: string;
  purposeText: string;
  brandName?: string;
  supportEmail?: string;
  validMinutes?: number;
  logoUrl?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const buildOtpEmailTemplate = ({
  otp,
  recipientName,
  purposeText,
  brandName = "Medico Billing",
  supportEmail = "support@medicobilling.com",
  validMinutes = 3,
  logoUrl,
}: BuildOtpEmailTemplateParams) => {
  const safeOtp = escapeHtml(otp);
  const safePurpose = escapeHtml(purposeText);
  const safeBrand = escapeHtml(brandName);
  const safeName = recipientName ? escapeHtml(recipientName) : "User";
  const safeSupportEmail = escapeHtml(supportEmail);

  const safeLogoUrl = logoUrl ? escapeHtml(logoUrl) : "";

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeBrand} OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background:#eef5fb; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5fb; padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; background:#ffffff; border-radius:18px; overflow:hidden;">
            <tr>
              <td style="padding:24px 28px; background:linear-gradient(135deg,#0e2a47,#1e6fa5);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" width="56">
                      ${
                        safeLogoUrl
                          ? `<img src="${safeLogoUrl}" alt="${safeBrand} Logo" width="46" height="46" style="display:block; width:46px; height:46px; border-radius:12px; object-fit:cover; background:#ffffff22;" />`
                          : `<div style="width:46px; height:46px; border-radius:12px; background:#ffffff22; color:#ffffff; font-size:26px; line-height:46px; text-align:center;">&#x2695;</div>`
                      }
                    </td>
                    <td valign="middle">
                      <div style="font-size:20px; line-height:1.2; font-weight:700; color:#ffffff;">${safeBrand}</div>
                      <div style="margin-top:4px; font-size:12px; color:#d5e7f5;">Secure Account Verification</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 28px 10px 28px; color:#10273d;">
                <div style="font-size:16px; line-height:1.5;">Hello ${safeName},</div>
                <div style="margin-top:12px; font-size:14px; line-height:1.7; color:#36526a;">
                  We received a request for <strong>${safePurpose}</strong>. Use the one-time password below to continue.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 28px 4px 28px;">
                <div style="background:#f3f9ff; border:1px solid #d2e7fb; border-radius:14px; padding:18px; text-align:center;">
                  <div style="font-size:12px; color:#5c748b; letter-spacing:0.1em; text-transform:uppercase;">Your Verification Code</div>
                  <div style="margin-top:10px; font-size:34px; font-weight:700; color:#0c4571; letter-spacing:0.26em;">${safeOtp}</div>
                  <div style="margin-top:10px; font-size:12px; color:#5c748b;">Valid for ${validMinutes} minutes only</div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 28px 24px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:12px 14px; background:#f8fbfe; border-radius:10px; font-size:12px; line-height:1.6; color:#557089;">
                      <strong style="color:#29425a;">Security Note:</strong> Never share this code with anyone. ${safeBrand} support will never ask for your OTP.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 22px 28px; background:#f7fafc; border-top:1px solid #e7edf3; text-align:center;">
                <div style="font-size:12px; color:#6a8297;">Need help? Contact: <a href="mailto:${safeSupportEmail}" style="color:#1a6ea9; text-decoration:none;">${safeSupportEmail}</a></div>
                <div style="margin-top:6px; font-size:12px; color:#8aa0b4;">&copy; ${new Date().getFullYear()} ${safeBrand}. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const buildOtpPlainText = ({
  otp,
  purposeText,
  brandName = "Medico Billing",
  validMinutes = 3,
}: {
  otp: string;
  purposeText: string;
  brandName?: string;
  validMinutes?: number;
}) => {
  return `Hello,\n\nUse this OTP for ${purposeText}: ${otp}\nThis OTP is valid for ${validMinutes} minutes.\n\nIf you did not request this, please ignore this email.\n\n- ${brandName} Security Team`;
};
