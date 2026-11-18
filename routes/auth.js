const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, password_hash FROM empleados WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const empleado = result.rows[0];
    const passwordValida = await bcrypt.compare(password, empleado.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: empleado.id, nombre: empleado.nombre, rol: empleado.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      empleado: { id: empleado.id, nombre: empleado.nombre, email: empleado.email, rol: empleado.rol }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;