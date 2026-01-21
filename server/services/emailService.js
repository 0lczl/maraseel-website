const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// In test mode, Resend only allows sending to your own verified email
const TEST_MODE = process.env.NODE_ENV === 'development';
const TEST_EMAIL = process.env.RESEND_TEST_EMAIL || 'alshrefabdul@gmail.com'; // Your Resend account email

async function sendPasswordResetEmail(email, resetUrl) {
  try {
    // In test mode, always send to your test email but show the original recipient in the message
    const recipientEmail = TEST_MODE ? TEST_EMAIL : email;
    
    const { data, error } = await resend.emails.send({
        from: 'مراسيل <noreply@maraseel.com>'  /* Instead of onboarding@resend.dev*/,
      to: [recipientEmail],
      subject: 'إعادة تعيين كلمة المرور - مراسيل 🚢',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
              padding: 20px;
              direction: rtl;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              padding: 40px;
              box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 2.5rem;
              color: #FF6B35;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .test-notice {
              background: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              color: #856404;
              text-align: center;
            }
            .content {
              color: #333;
              line-height: 1.8;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
              text-align: center;
            }
            .warning {
              background: #ffe6e6;
              border: 1px solid #f44336;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              color: #c62828;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${TEST_MODE ? `
            <div class="test-notice">
              <strong>🧪 وضع الاختبار</strong><br>
              البريد الأصلي المطلوب: <strong>${email}</strong><br>
              في الإنتاج، سيتم إرساله إلى البريد الصحيح
            </div>
            ` : ''}
            
            <div class="header">
              <div class="logo">🚢 مراسيل</div>
              <p style="color: #666;">حلول شحن موثوقة وسريعة</p>
            </div>
            
            <div class="content">
              <h2 style="color: #FF6B35;">إعادة تعيين كلمة المرور</h2>
              
              <p>مرحباً،</p>
              
              <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في مراسيل.</p>
              
              <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ تنبيه أمني:</strong>
                <ul style="margin: 10px 0; padding-right: 20px;">
                  <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة</li>
                  <li>لا تشارك هذا الرابط مع أي شخص</li>
                </ul>
              </div>
              
              <p>إذا لم يعمل الزر، يمكنك نسخ ولصق الرابط التالي في متصفحك:</p>
              <p style="word-break: break-all; color: #FF6B35; font-size: 14px;">
                ${resetUrl}
              </p>
            </div>
            
            <div class="footer">
              <p><strong>مراسيل</strong> - في الوقت المحدد</p>
              <p>📧 info.maraseel@gmail.com | 📞 +966 544115555</p>
              <p>📍 الجبيل, المملكة العربية السعودية</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw error;
    }

    console.log(`✅ Email sent successfully to ${recipientEmail}${TEST_MODE ? ` (original: ${email})` : ''}:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

async function sendVerificationEmail(email, verificationUrl) {
  try {
    const recipientEmail = TEST_MODE ? TEST_EMAIL : email;
    
    const { data, error } = await resend.emails.send({
      from: 'Maraseel <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: 'تأكيد البريد الإلكتروني - مراسيل 🚢',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
              padding: 20px;
              direction: rtl;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              padding: 40px;
              box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 2.5rem;
              color: #FF6B35;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .test-notice {
              background: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              color: #856404;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${TEST_MODE ? `
            <div class="test-notice">
              <strong>🧪 وضع الاختبار</strong><br>
              البريد الأصلي: <strong>${email}</strong>
            </div>
            ` : ''}
            
            <div class="header">
              <div class="logo">🚢 مراسيل</div>
              <p style="color: #666;">حلول شحن موثوقة وسريعة</p>
            </div>
            
            <div style="color: #333; line-height: 1.8;">
              <h2 style="color: #FF6B35;">مرحباً بك في مراسيل!</h2>
              
              <p>شكراً لتسجيلك معنا. نحن سعداء بانضمامك إلى عائلة مراسيل.</p>
              
              <p>يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
              </div>
              
              <p>إذا لم يعمل الزر، يمكنك نسخ ولصق الرابط التالي:</p>
              <p style="word-break: break-all; color: #FF6B35; font-size: 14px;">
                ${verificationUrl}
              </p>
            </div>
            
            <div class="footer">
              <p><strong>مراسيل</strong> - في الوقت المحدد</p>
              <p>📧 info.maraseel@gmail.com | 📞 +966 544115555</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw error;
    }

    console.log(`✅ Verification email sent to ${recipientEmail}${TEST_MODE ? ` (original: ${email})` : ''}:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail
};
