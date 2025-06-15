import jwt from 'jsonwebtoken';
import Token from '../models/tokenManagement.js';
import { JWT_CONFIG } from '../config/main.js';
import { generateTokens, cookieConfig } from '../utils/index.js';

// Función para verificar token
export const verifyToken = (token, token_type) => {
  try {
		const JWT_SECRET = token_type === 'refresh' ? JWT_CONFIG.refresh_token_secret : JWT_CONFIG.access_token_secret;
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware de autenticación
export const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el access token de las cookies
    const accessToken = req.cookies?.access_token;
    
    if (!accessToken) {
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    // Verificar el access token
    const decoded = verifyToken(accessToken, 'access');
    
    if (decoded) {
      // Token válido - renovar y continuar
      const { accessToken: newAccessToken } = generateTokens(decoded.userId);
      
      // Establecer el nuevo token en las cookies
      res.cookie('access_token', newAccessToken, cookieConfig);
      
      // Agregar usuario al request
      req.user = { userId: decoded.userId };
      return next();
    }

    // Access token no válido - verificar refresh token
    const user = await Token.findById(req.user?.userId || null);
    
    if (!user || !user.refreshToken) {
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    // Verificar refresh token
    const refreshDecoded = verifyToken(user.refreshToken, 'refresh');
    
    if (!refreshDecoded) {
      // Refresh token también inválido
      await Token.findByIdAndUpdate(user.id, { refreshToken: null });
      
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    // Refresh token válido - generar nuevos tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    
    // Actualizar refresh token en la DB
    await Token.findByIdAndUpdate(user.id, { refreshToken: newRefreshToken });
    
    // Establecer nuevo access token en cookies
    res.cookie('access_token', newAccessToken, cookieConfig);
    
    // Agregar usuario al request
    req.user = { userId: user.id };
    next();
    
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para aplicar solo en rutas específicas
export const conditionalAuth = (req, res, next) => {
  // Rutas que no requieren autenticación
  const publicRoutes = ['/auth/sign-in'];
  
  // Verificar si la ruta actual está en las rutas públicas
  const isPublicRoute = publicRoutes.some(route => 
    req.path.startsWith(route) || req.originalUrl.startsWith(route)
  );
  
  if (isPublicRoute) {
    return next();
  }
  console.log(`Ruta protegida: ${req.path}`);
  // Aplicar middleware de autenticación
  return authMiddleware(req, res, next);
};