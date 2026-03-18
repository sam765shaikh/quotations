
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { generateQuotationNumber } = require('./auth');

router.use(auth);

// Get all quotations
router.get('/', async (req, res) => {
  try {
    const [quotations] = await db.query(
      `SELECT id, quotation_number, client_name, client_email, valid_until, subtotal, tax_rate, tax_amount, total, status, created_at 
       FROM quotations WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(quotations);
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get single quotation
router.get('/:id', async (req, res) => {
  try {
    const [quotations] = await db.query(
      'SELECT * FROM quotations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (quotations.length === 0) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    const [items] = await db.query(
      'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order, id',
      [req.params.id]
    );

    res.json({ ...quotations[0], items });

  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create quotation
router.post('/', async (req, res) => {
  try {

    const {
      client_name,
      client_email,
      client_phone,
      valid_until,
      notes,
      items = [],
      tax_rate = 0
    } = req.body;

    if (!client_name) {
      return res.status(400).json({ message: 'Client name is required.' });
    }

    const quotation_number = generateQuotationNumber();
    let subtotal = 0;

    const [result] = await db.query(
      `INSERT INTO quotations 
      (user_id, quotation_number, client_name, client_email, client_phone, valid_until, notes, tax_rate, subtotal, tax_amount, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        quotation_number,
        client_name,
        client_email || null,
        client_phone || null,
        valid_until || null,
        notes || null,
        tax_rate,
        0,
        0,
        0
      ]
    );

    const quotationId = result.insertId;

    // ITEMS
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {

        const item = items[i];

        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unit_price) || 0;


        const itemTotal = qty * unitPrice;

        subtotal += itemTotal;

        await db.query(
          `INSERT INTO quotation_items 
          (quotation_id, product_name, description, quantity, unit_price, total_price, sort_order) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            quotationId,
            item.product_name || 'Product',
            item.description || null,
            qty,
            unitPrice,
            itemTotal,
            i
          ]
        );
      }
    }

    // ✅ GST CALCULATION (ONLY HERE)
    const taxAmount = (subtotal * Number(tax_rate || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    await db.query(
      `UPDATE quotations 
       SET subtotal = ?, tax_amount = ?, total = ?
       WHERE id = ?`,
      [subtotal, taxAmount, grandTotal, quotationId]
    );

    const [created] = await db.query('SELECT * FROM quotations WHERE id = ?', [quotationId]);
    const [createdItems] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotationId]);

    res.status(201).json({ ...created[0], items: createdItems });

  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update quotation
router.put('/:id', async (req, res) => {
  try {

    const [existing] = await db.query(
      'SELECT id FROM quotations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    const {
      client_name,
      client_email,
      client_phone,
      valid_until,
      notes,
      items = [],
      tax_rate = 0,
      status
    } = req.body;

    let subtotal = 0;

    await db.query('DELETE FROM quotation_items WHERE quotation_id = ?', [req.params.id]);

    // ITEMS
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {

        const item = items[i];

        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unit_price) || 0;

        // ✅ NO GST HERE
        const itemTotal = qty * unitPrice;

        subtotal += itemTotal;

        await db.query(
          `INSERT INTO quotation_items 
          (quotation_id, product_name, description, quantity, unit_price, total_price, sort_order) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.params.id,
            item.product_name || 'Product',
            item.description || null,
            qty,
            unitPrice,
            itemTotal,
            i
          ]
        );
      }
    }

    // ✅ GST CALCULATION
    const taxAmount = (subtotal * Number(tax_rate || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    await db.query(
      `UPDATE quotations SET 
      client_name = COALESCE(?, client_name),
      client_email = COALESCE(?, client_email),
      client_phone = COALESCE(?, client_phone),
      valid_until = ?,
      notes = ?,
      tax_rate = ?,
      subtotal = ?,
      tax_amount = ?,
      total = ?,
      status = COALESCE(?, status)
      WHERE id = ?`,
      [
        client_name,
        client_email,
        client_phone,
        valid_until || null,
        notes || null,
        tax_rate,
        subtotal,
        taxAmount,
        grandTotal,
        status || undefined,
        req.params.id
      ]
    );

    const [updated] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
    const [updatedItems] = await db.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [req.params.id]);

    res.json({ ...updated[0], items: updatedItems });

  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete quotation
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM quotations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    res.json({ message: 'Quotation deleted successfully.' });

  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
