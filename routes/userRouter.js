// routes/userRouter.js
import express from 'express';
import {
  createUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  updatePassword,   // <-- o updatePassword si así lo exportas
  toggleUsuario,
  deleteUsuario,
  getUsuariosByRole,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true, scope: 'usuarios' })); // temporal

router.post('/register', createUsuario);
router.get('/all-users', getAllUsuarios);
router.get('/user/:id', getUsuarioById);
router.patch('/update-user/:id', updateUsuario);
router.patch('/update-password/:id', updatePassword); // o updatePassword
router.patch('/toggle-user/:id', toggleUsuario);
router.delete('/delete-user/:id', deleteUsuario);
router.get('/report', getUsuariosByRole); // ?rol=admin

export default router;
