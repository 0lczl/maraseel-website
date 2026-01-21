const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAdmin } = require('../middleware/adminAuth');

// All admin routes require admin role
router.use(requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE email_verified_at IS NOT NULL) as verified_users,
        COUNT(*) FILTER (WHERE last_login_at IS NOT NULL) as users_logged_in,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_month
      FROM users
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        email, 
        role, 
        email_verified_at, 
        last_login_at, 
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent self-deletion
    if (userId === req.session.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING email', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: `User ${result.rows[0].email} deleted successfully` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }
    
    // Prevent changing own role
    if (userId === req.session.userId) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING email, role',
      [role, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: `User ${result.rows[0].email} role changed to ${role}` });
  } catch (error) {
    console.error('Admin change role error:', error);
    res.status(500).json({ message: 'Failed to change user role' });
  }
});

module.exports = router;
