import express from 'express';
import morgan from 'morgan';
import { ALLOWED_ORIGINS, NODE_ENV } from './config/main.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Importar middlewares
import { conditionalAuth } from './middlewares/authMiddleware.js';

// Importar rutas

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
const app = express();

// middlewares basicos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());

// middleware de logging
if (NODE_ENV === 'production') {
    app.use(morgan('combined'));  // Más formal para producción
	// middleware de autenticación condicional
	// Este middleware se ejecutará en todas las rutas excepto login
	app.use(conditionalAuth);
} else {
    app.use(morgan('dev'));       // Con colores para desarrollo
}



// Routes
app.use('/auth', auth);
app.use('/products', products);
app.use('/baskets', baskets);
app.use('/basket-items', basketItems);
app.use('/alumnos', alumnos);
app.use('/coupons', coupons);
app.use('/profesores', profesores);
app.use('/cash-register', cashRegister);

// Manejo de errores
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
