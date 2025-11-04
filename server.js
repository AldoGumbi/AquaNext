import app from './app.js';
import dotenv from 'dotenv';
import os from 'os';

import fs from 'fs';
import https from 'https';


// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

let server;
if(isProduction) {
//	const sslOptions = {
//		key: fs.readFileSync('/etc/letsencrypt/live/api.nimbuscloud.mx/privkey1.pem'),
//		cert: fs.readFileSync('/etc/letsencrypt/live/api.nimbuscloud.mx/fullchain1.pem'),
//	};
//	server = https.createServer(sslOptions, app).listen(PORT, () => {
//		console.log(`HTTPS Worker ${process.pid} corriendo en puerto ${PORT}`);
//	});
 server = app.listen(PORT, () => {
                console.log(`Server ${process.pid} is running on port ${PORT} as PRODUCTION mode`);
        });
}
else{
	server = app.listen(PORT, () => {
		console.log(`Server ${process.pid} is running on port ${PORT} as development mode`);
	});
}

// Optimización de timeouts
server.keepAliveTimeout = 30000; // 30 segundos
server.headersTimeout = 35000; // 5 segundos más

process.on('SIGTERM', () => {
	console.log('Shutting down gracefully...');
	server.close(() => {
		process.exit(0);
	});
});
