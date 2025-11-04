// controllers/userController.js
import usuariosModel from '../models/userModel.js';
// import bcrypt from 'bcrypt'; // ⛔️ Temporalmente deshabilitado hasta que actives el hashing

// Crear usuario
export const createUsuario = async (req, res) => {
  try {
    const { username, email, password, rol, activo, turno } = req.body;

    console.log("[CONTROLLER] createUsuario -> payload recibido:", req.body);

    if (!username || !email || !password) {
      return res.status(400).json({
        data: false,
        message: 'username, email y password son requeridos',
        error: true,
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // ⚠️ Temporal: sin hash

    const usuario = {
      username: String(username).trim(),
      email: String(email).trim(),
      password: hashedPassword,
      rol: rol || 'usuario',
      activo: activo ?? 1,
      turno: turno || null, // 👈 nuevo campo
    };

    console.log("[CONTROLLER] createUsuario -> objeto a insertar:", usuario);

    const id = await usuariosModel.create(usuario);

    console.log("[CONTROLLER] createUsuario -> usuario creado con ID:", id);

    res.status(201).json({
      data: true,
      message: 'Usuario creado correctamente',
      id,
      error: false,
    });
  } catch (error) {
    console.error("[CONTROLLER] createUsuario -> ERROR:", error);
    res.status(500).json({
      data: false,
      message: 'Error interno al crear usuario',
      error: error.message,
    });
  }
};

// Obtener todos los usuarios
export const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await usuariosModel.getAll();

    console.log("[CONTROLLER] getAllUsuarios -> registros obtenidos:", usuarios);

    if (!usuarios?.length) {
      return res.status(200).json({
        data: [],
        message: 'No se encontraron usuarios',
        error: false,
      });
    }

    res.status(200).json({
      data: usuarios,
      message: 'Usuarios obtenidos correctamente',
      error: false,
    });
  } catch (error) {
    console.error("[CONTROLLER] getAllUsuarios -> ERROR:", error);
    res.status(500).json({
      data: false,
      message: 'Error interno al obtener usuarios',
      error: error.message,
    });
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[CONTROLLER] getUsuarioById -> ID recibido:", id);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        data: false,
        message: 'ID inválido',
        error: true,
      });
    }

    const usuario = await usuariosModel.getById(id);

    console.log("[CONTROLLER] getUsuarioById -> resultado:", usuario);

    if (!usuario) {
      return res.status(404).json({
        data: false,
        message: 'Usuario no encontrado',
        error: true,
      });
    }

    res.status(200).json({
      data: usuario,
      message: 'Usuario obtenido correctamente',
      error: false,
    });
  } catch (error) {
    console.error("[CONTROLLER] getUsuarioById -> ERROR:", error);
    res.status(500).json({
      data: false,
      message: 'Error interno al obtener usuario',
      error: error.message,
    });
  }
};

// Actualizar usuario (sin password)
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, rol, activo, turno } = req.body;

    console.log("[CONTROLLER] updateUsuario -> ID recibido:", id, "Payload:", req.body);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ data: false, message: 'ID inválido', error: true });
    }

    if (!username || !email) {
      return res.status(400).json({ data: false, message: 'username y email son requeridos', error: true });
    }

    const usuario = {
      username: String(username).trim(),
      email: String(email).trim(),
      rol: rol || 'usuario',
      activo: activo ?? 1,
      turno: turno || null, // 👈 nuevo campo
    };

    console.log("[CONTROLLER] updateUsuario -> objeto a actualizar:", usuario);

    const updated = await usuariosModel.update(id, usuario);
    console.log("[CONTROLLER] updateUsuario -> resultado:", updated);

    if (updated) {
      res.status(200).json({ data: true, message: 'Usuario actualizado correctamente', error: false });
    } else {
      res.status(404).json({ data: false, message: 'Usuario no encontrado', error: true });
    }
  } catch (error) {
    console.error("[CONTROLLER] updateUsuario -> ERROR:", error);
    res.status(500).json({ data: false, message: 'Error interno al actualizar usuario', error: error.message });
  }
};

// Actualizar contraseña
export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    console.log("[CONTROLLER] updatePassword -> ID recibido:", id, "Nueva contraseña:", password);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ data: false, message: 'ID inválido', error: true });
    }

    if (!password) {
      return res.status(400).json({ data: false, message: 'Nueva contraseña requerida', error: true });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // ⚠️ Temporal: sin hash

    const updated = await usuariosModel.updatePassword(id, hashedPassword);

    console.log("[CONTROLLER] updatePassword -> resultado:", updated);

    if (updated) {
      res.status(200).json({ data: true, message: 'Contraseña actualizada correctamente', error: false });
    } else {
      res.status(404).json({ data: false, message: 'Usuario no encontrado', error: true });
    }
  } catch (error) {
    console.error("[CONTROLLER] updatePassword -> ERROR:", error);
    res.status(500).json({ data: false, message: 'Error interno al actualizar contraseña', error: error.message });
  }
};

// Activar o desactivar usuario
export const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    console.log("[CONTROLLER] toggleUsuario -> ID:", id, "activo:", activo);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ data: false, message: 'ID inválido', error: true });
    }

    if (activo === undefined) {
      return res.status(400).json({ data: false, message: 'Campo activo requerido', error: true });
    }

    const updated = await usuariosModel.toggleActivo(id, activo);

    console.log("[CONTROLLER] toggleUsuario -> resultado:", updated);

    if (updated) {
      res.status(200).json({
        data: true,
        message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`,
        error: false,
      });
    } else {
      res.status(404).json({ data: false, message: 'Usuario no encontrado', error: true });
    }
  } catch (error) {
    console.error("[CONTROLLER] toggleUsuario -> ERROR:", error);
    res.status(500).json({ data: false, message: 'Error interno al actualizar estado del usuario', error: error.message });
  }
};

// Reporte por rol
export const getUsuariosByRole = async (req, res) => {
  try {
    const rol = req.params.rol ?? req.query.rol;

    console.log("[CONTROLLER] getUsuariosByRole -> rol recibido:", rol);

    if (!rol) {
      return res.status(400).json({ data: false, message: 'Rol requerido', error: true });
    }

    const usuarios = await usuariosModel.getReportByRole(rol);

    console.log("[CONTROLLER] getUsuariosByRole -> usuarios encontrados:", usuarios);

    res.status(200).json({
      data: usuarios,
      message: `Usuarios con rol ${rol} obtenidos correctamente`,
      error: false,
    });
  } catch (error) {
    console.error("[CONTROLLER] getUsuariosByRole -> ERROR:", error);
    res.status(500).json({ data: false, message: 'Error interno al generar reporte por rol', error: error.message });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("[CONTROLLER] deleteUsuario -> ID recibido:", id);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ data: false, message: 'ID inválido', error: true });
    }

    const deleted = await usuariosModel.delete(id);

    console.log("[CONTROLLER] deleteUsuario -> resultado:", deleted);

    const fueEliminado =
      deleted === true ||
      deleted === 1 ||
      deleted?.affectedRows > 0 ||
      deleted?.rowCount > 0;

    if (fueEliminado) {
      return res.status(200).json({ data: true, message: 'Usuario eliminado correctamente', error: false });
    }

    return res.status(404).json({ data: false, message: 'Usuario no encontrado', error: true });
  } catch (error) {
    console.error("[CONTROLLER] deleteUsuario -> ERROR:", error);
    return res.status(500).json({ data: false, message: 'Error interno al eliminar usuario', error: error.message });
  }
};
