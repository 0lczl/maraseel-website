const express = require('express');
const router = express.Router();
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateToken, hashToken } = require('../utils/tokens');
const db = require('../db/database');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { sendPasswordResetEmail } = require('../services/emailService');


// POST /api/auth/signup - NO EMAIL VERIFICATION
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' });
    }
    
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل مسبقاً' });
    }
    
    const passwordHash = await hashPassword(password);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, role, email_verified_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email',
      [email, passwordHash, 'user']
    );
    
    console.log('✅ New user:', email);
    
    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح! جارٍ تحويلك لتسجيل الدخول...',
      user: { id: result.rows[0].id, email: email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'فشل التسجيل. يرجى المحاولة مرة أخرى.' });
  }
});


// POST /api/auth/login - NO EMAIL VERIFICATION CHECK
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const user = result.rows[0];
    
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    
    res.json({ 
      message: 'تم تسجيل الدخول بنجاح', 
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }
});


// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'فشل تسجيل الخروج' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  });
});


// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      authenticated: true, 
      user: { 
        id: req.session.userId, 
        email: req.session.userEmail, 
        role: req.session.userRole 
      } 
    });
  } else {
    res.json({ authenticated: false });
  }
});


// POST /api/auth/forgot-password
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // User doesn't exist - still return success (security best practice)
      return res.json({ 
        message: 'إذا كان هذا البريد موجودًا، ستتلقى رابط إعادة التعيين.' 
      });
    }
    
    const userId = result.rows[0].id;
    
    // Generate reset token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Invalidate old tokens
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [userId]);
    
    // Create new token
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
    
    // Generate reset URL
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password.html?token=${token}`;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Log to console in development
    if (isDevelopment) {
      console.log('\n=== 🔗 RESET LINK ===');
      console.log(resetUrl);
      console.log('=====================\n');
    }
    
    // Try to send email BUT DON'T WAIT FOR IT - Fire and forget
    sendPasswordResetEmail(email, resetUrl)
      .then(result => {
        if (result.success) {
          console.log('✅ Email sent to:', email);
        } else {
          console.log('⚠️ Email failed (but continuing):', result.error?.message);
        }
      })
      .catch(err => {
        console.log('⚠️ Email error (but continuing):', err.message);
      });
    
    // ALWAYS return success immediately (don't wait for email)
    return res.json({
      message: isDevelopment 
        ? 'تم إنشاء رابط إعادة التعيين بنجاح. انقر على الرابط أدناه.'
        : 'إذا كان البريد موجودًا، ستتلقى رابط إعادة التعيين.',
      devLink: isDevelopment ? resetUrl : undefined
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({ 
      message: 'فشل الطلب. يرجى المحاولة مرة أخرى.' 
    });
  }
});



// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'الرمز وكلمة المرور مطلوبة' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }
    
    const tokenHash = hashToken(token);
    const result = await db.query(
      'SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()',
      [tokenHash]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'رمز غير صالح أو منتهي الصلاحية' });
    }
    
    const userId = result.rows[0].user_id;
    const newPasswordHash = await hashPassword(newPassword);
    
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1', [tokenHash]);
    
    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'فشلت إعادة التعيين' });
  }
});


module.exports = router;
