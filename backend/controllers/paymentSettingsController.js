const logger = require('../utils/logger');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

const getPaymentSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM payment_settings LIMIT 1');
    
    if (settings.length === 0) {
      return res.json(null);
    }

    res.json(settings[0]);
  } catch (error) {
    logger.error('Get payment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePaymentSettings = async (req, res) => {
  try {
    const { bank_name, account_name, account_number, amount, instructions, payment_network } = req.body;
    
    const [existing] = await pool.query('SELECT * FROM payment_settings LIMIT 1');
    
    let qrCodePath = null;
    if (req.file) {
      qrCodePath = `/uploads/payment_settings/${req.file.filename}`;
      
      if (existing.length > 0 && existing[0].qr_code_path) {
        const oldPath = path.join(__dirname, '../../', existing[0].qr_code_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO payment_settings (bank_name, account_name, account_number, amount, qr_code_path, instructions, payment_network, updated_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [bank_name, account_name, account_number, amount, qrCodePath, instructions, payment_network, req.user.id]
      );
    } else {
      let query = 'UPDATE payment_settings SET ';
      let values = [];
      let updates = [];

      if (bank_name !== undefined) { updates.push('bank_name = ?'); values.push(bank_name); }
      if (account_name !== undefined) { updates.push('account_name = ?'); values.push(account_name); }
      if (account_number !== undefined) { updates.push('account_number = ?'); values.push(account_number); }
      if (amount !== undefined) { updates.push('amount = ?'); values.push(amount); }
      if (instructions !== undefined) { updates.push('instructions = ?'); values.push(instructions); }
      if (payment_network !== undefined) { updates.push('payment_network = ?'); values.push(payment_network); }
      if (qrCodePath) { updates.push('qr_code_path = ?'); values.push(qrCodePath); }
      updates.push('updated_by = ?');
      values.push(req.user.id);

      if (updates.length > 0) {
        query += updates.join(', ') + ' WHERE id = ?';
        values.push(existing[0].id);
        await pool.query(query, values);
      }
    }

    res.json({ message: 'Payment settings updated successfully' });
  } catch (error) {
    logger.error('Update payment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPaymentSettings,
  updatePaymentSettings
};

