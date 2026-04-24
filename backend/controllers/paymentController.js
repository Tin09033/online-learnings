const logger = require('../utils/logger');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

const normalizeProofPath = (proofPath) => {
  if (!proofPath) return null;
  if (proofPath.startsWith('/uploads/')) return proofPath;
  const match = proofPath.match(/uploads[/\\](.+)$/);
  if (match) return `/uploads/${match[1].replace(/\\/g, '/')}`;
  return proofPath;
};

const uploadPayment = async (req, res) => {
  try {
    const { enrollment_id, payment_method, reference_number, amount, notes } = req.body;

    if (!enrollment_id) {
      return res.status(400).json({ message: 'Enrollment ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof is required' });
    }

    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE id = ? AND user_id = ?',
      [enrollment_id, req.user.id]
    );

    if (enrollment.length === 0) {
      if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
      return res.status(404).json({ message: 'Enrollment not found or you do not have permission' });
    }

    const [existingPayment] = await pool.query(
      'SELECT * FROM payments WHERE enrollment_id = ?',
      [enrollment_id]
    );

    const proofPath = `/uploads/payments/${req.file.filename}`;
    let paymentId;
    if (existingPayment.length > 0) {
      if (existingPayment[0].proof_path && fs.existsSync(path.join(__dirname, '..', existingPayment[0].proof_path))) {
        try { fs.unlinkSync(path.join(__dirname, '..', existingPayment[0].proof_path)); } catch (e) {}
      }
      await pool.query(
        `UPDATE payments SET proof_path = ?, payment_method = ?, reference_number = ?, amount = ?, notes = ?, status = 'pending', verified_by = NULL, verified_at = NULL WHERE enrollment_id = ?`,
        [proofPath, payment_method || 'bank_transfer', reference_number || '', amount || 0, notes || '', enrollment_id]
      );
      paymentId = existingPayment[0].id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO payments (enrollment_id, user_id, course_id, proof_path, payment_method, reference_number, amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [enrollment_id, req.user.id, enrollment[0].course_id, proofPath, payment_method || 'bank_transfer', reference_number || '', amount || 0, notes || '']
      );
      paymentId = result.insertId;
    }

    if (enrollment[0].status === 'pending') {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id) VALUES (?, 'enrollment_pending', 'Payment Submitted', 'Your payment proof has been submitted and is pending verification.', ?, ?)`,
        [req.user.id, enrollment[0].course_id, enrollment_id]
      );
    }

    res.status(201).json({
      message: 'Payment proof uploaded successfully',
      payment: {
        id: paymentId,
        proof_path: proofPath,
        payment_method,
        reference_number
      }
    });
  } catch (error) {
    logger.error('Upload payment error:', error);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, c.title as course_title, e.status as enrollment_status
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    const normalizedPayments = payments.map(p => ({
      ...p,
      proof_path: normalizeProofPath(p.proof_path)
    }));

    res.json(normalizedPayments);
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPaymentByEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const [payment] = await pool.query(
      `SELECT p.*, c.title as course_title 
       FROM payments p 
       JOIN courses c ON p.course_id = c.id 
       WHERE p.enrollment_id = ? AND p.user_id = ?`,
      [enrollmentId, req.user.id]
    );

    if (payment.length === 0) {
      return res.json(null);
    }

    const normalizedPayment = {
      ...payment[0],
      proof_path: normalizeProofPath(payment[0].proof_path)
    };

    res.json(normalizedPayment);
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [payment] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await pool.query(
      `UPDATE payments SET status = ?, verified_by = ?, verified_at = NOW() WHERE id = ?`,
      [status, req.user.id, id]
    );

    if (status === 'verified') {
      await pool.query(
        `UPDATE enrollments SET status = 'active' WHERE id = ?`,
        [payment[0].enrollment_id]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id) VALUES (?, 'payment_confirmed', 'Payment Confirmed!', 'Your payment has been verified. You now have full access to the course.', ?, ?)`,
        [payment[0].user_id, payment[0].course_id, payment[0].enrollment_id]
      );
    } else {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, course_id, enrollment_id) VALUES (?, 'enrollment_pending', 'Payment Rejected', ?, ?, ?)`,
        [payment[0].user_id, notes || 'Your payment proof was rejected. Please upload a new one.', payment[0].course_id, payment[0].enrollment_id]
      );
    }

    res.json({ message: `Payment ${status} successfully` });
  } catch (error) {
    logger.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    logger.debug('getAllPayments called');
    const [payments] = await pool.query(`
      SELECT p.*, c.title as course_title, u.name as user_name, u.email as user_email,
             e.status as enrollment_status
      FROM payments p
      LEFT JOIN courses c ON p.course_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      ORDER BY p.created_at DESC
    `);
    
    const normalizedPayments = payments.map(p => ({
      ...p,
      proof_path: normalizeProofPath(p.proof_path)
    }));
    
    logger.debug('Total payments found:', payments.length);

    res.json(normalizedPayments);
  } catch (error) {
    logger.error('Get all payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, c.title as course_title, u.name as user_name, u.email as user_email
      FROM payments p
      LEFT JOIN courses c ON p.course_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      WHERE p.status = 'pending' AND (e.status = 'pending' OR e.status IS NULL)
      ORDER BY p.created_at DESC
    `);

    const normalizedPayments = payments.map(p => ({
      ...p,
      proof_path: normalizeProofPath(p.proof_path)
    }));

    res.json(normalizedPayments);
  } catch (error) {
    logger.error('Get pending payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadPayment,
  getMyPayments,
  getPaymentByEnrollment,
  verifyPayment,
  getAllPayments,
  getPendingPayments
};
