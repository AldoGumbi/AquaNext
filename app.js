import express from 'express';
import morgan from 'morgan';
import { ALLOWED_ORIGINS, NODE_ENV } from './config/main.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Importar middlewares
import { conditionalAuth } from './middlewares/authMiddleware.js';

// Importar rutas

//Dashboard
import dashboardRoutes from './routes/dashboard.js';

//AUTH
import auth from './routes/authRouter.js';
// SALE POINT
import products from "./routes/products.js";
import baskets from "./routes/basket.js";
import basketItems from "./routes/basketItems.js";
import coupons from "./routes/couponsRouter.js";
// ALUMNOS
import alumnos from "./routes/alumnoRouter.js";
// PROFESORES
import profesores from "./routes/teacherRouter.js";
// CASH REGISTER
import cashRegister from "./routes/cashRegister.js";
// GRUPOS
import grupos from "./routes/groupsRouter.js";
// INSCRIPCIONES Y MENSUALIDADES
import inscripcionesMensualidades from "./routes/InscripcionesMensualidades.js";
// DISPONIBILIDAD DE CUPOS
import disponibilidadCupos from "./routes/disponibilidadCuposRouter.js";
// Ventas
import salesRouter from './routes/salesRouter.js';
// Usuarios
import usuarios from './routes/userRouter.js';
// Acceso Alumnos
import accesoAlumnosRouter from "./routes/acceso-alumnosRouter.js";
// Movimientos de mensualidades
import mensualidadMovimientoRouter from './routes/mensualidadMovimientoRouter.js';
// Movimientos de asistencias
import asistenciaMovimientosRouter from './routes/asistenciaMovimientosRouter.js'

// DISPONIBILIDAD DE CUPOS IA
import disponibilidadCuposIA from "./routes/disponibilidadCuposIARouter.js";
const app = express();

// middlewares basicos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS CORRECTAMENTE CONFIGURADO
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

// middleware de logging y auth
if (NODE_ENV === 'production') {
  app.use(morgan('dev'));
  app.use(conditionalAuth);
} else {
  app.use(morgan('dev'));
}

// ✅ ahora sí: rutas
app.use('/dashboard', dashboardRoutes);
app.use('/auth', auth);
app.use('/products', products);
app.use('/baskets', baskets);
app.use('/basket-items', basketItems);
app.use('/alumnos', alumnos);
app.use('/coupons', coupons);
app.use('/profesores', profesores);
app.use('/cash-register', cashRegister);
app.use('/groups', grupos);
app.use('/school-transactions', inscripcionesMensualidades);
app.use('/availability', disponibilidadCupos);
app.use('/sales', salesRouter);
app.use('/usuarios', usuarios);
app.use("/api/acceso-alumnos", accesoAlumnosRouter);
app.use('/mensualidad-movimiento', mensualidadMovimientoRouter);
app.use('/asistencia-movimientos', asistenciaMovimientosRouter);
app.use('/availability-ia', disponibilidadCuposIA);
// Errores
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  res.status(500).json({
    message: 'Something broke!',
    ...(NODE_ENV === 'development' && { error: err.message })
  });
});

export default app;
