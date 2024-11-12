import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Por ahora, usaremos un usuario hardcodeado para pruebas
      const validCredentials = email === 'admin@classsync.com' && password === 'admin123';

      if (!validCredentials) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Generar token
      const token = jwt.sign(
        { userId: 1, email },
        process.env.JWT_SECRET || 'tu_secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: 1,
          email: email,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  validateToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secret_key');
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  }
};