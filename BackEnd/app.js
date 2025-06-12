import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

import cors from 'cors';

// (1) Importar rutas
//AUTH
import login from './routes/loginRouter.js';
// SALE POINT
import products from "./routes/products.js";
import baskets from "./routes/basket.js";

const app = express();

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`);
	next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());


// Routes
app.use('/auth', login);
app.use('/products', products);
app.use('/baskets', baskets);

// 6. Manejo de errores (Mejorado)
app.use((req, res, next) => {
	res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
	console.error(`[${new Date().toISOString()}] Error:`, err.stack);
	res.status(500).json({
		message: 'Something broke!',
		...(process.env.NODE_ENV === 'development' && { error: err.message })
	});
});

export default app;
