// config/db.js - Versión optimizada basada en tu archivo actual
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool principal optimizado para transacciones pesadas
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    
    // CONFIGURACIONES VÁLIDAS PARA MYSQL2
    waitForConnections: true,
    connectionLimit: 20,              // Aumentado de 10 a 20
    queueLimit: 0,                    // Sin límite en la cola
    
    // Optimizaciones específicas para transacciones pesadas
    multipleStatements: true,         // Permitir múltiples statements
    
    // Configuraciones de MySQL para mejor rendimiento
    typeCast: function (field, next) {
        if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1'); // Convertir TINYINT a boolean
        }
        return next();
    },
    
    // Configuraciones adicionales de rendimiento
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    
    // Pool de conexiones más eficiente
    idleTimeout: 300000,             // 5 minutos
    maxIdle: 10,                     // Máximo de conexiones idle
});

// Test de conexión inicial (tu código existente mejorado)
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Configurar parámetros de sesión para optimización
        await connection.query('SET SESSION innodb_lock_wait_timeout = 120');
        await connection.query('SET SESSION transaction_isolation = "READ-COMMITTED"');
        
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
})();

// Función helper para obtener conexión con configuración optimizada
export const getOptimizedConnection = async () => {
    const connection = await pool.getConnection();
    
    // Configuraciones específicas para transacciones pesadas
    try {
        await connection.query('SET SESSION innodb_lock_wait_timeout = 120');
        await connection.query('SET SESSION autocommit = 0');
        await connection.query('SET SESSION transaction_isolation = "READ-COMMITTED"');
    } catch (error) {
        console.warn('No se pudieron aplicar optimizaciones de sesión:', error.message);
    }
    
    return connection;
};

// Función para transacciones optimizadas con reintentos
export const executeWithRetry = async (operation, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const connection = await getOptimizedConnection();
        
        try {
            await connection.beginTransaction();
            
            // Configurar timeout a nivel de conexión individual
            await connection.query('SET SESSION innodb_lock_wait_timeout = 120');
            
            const result = await operation(connection);
            await connection.commit();
            connection.release();
            return result;
            
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError.message);
            }
            connection.release();
            
            lastError = error;
            
            // Reintentar solo en errores de deadlock o timeout
            if (
                attempt < maxRetries && 
                (error.code === 'ER_LOCK_DEADLOCK' || 
                 error.code === 'ER_LOCK_WAIT_TIMEOUT' ||
                 error.code === 'ECONNRESET' ||
                 error.code === 'PROTOCOL_CONNECTION_LOST')
            ) {
                console.warn(`Intento ${attempt} falló, reintentando en ${100 * attempt}ms...`, error.code);
                await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Backoff exponencial
                continue;
            }
            
            throw error;
        }
    }
    
    throw lastError;
};

// Event listeners para manejo de errores del pool (opcionales - puedes comentarlos si no los necesitas)
pool.on('connection', (connection) => {
    console.log('Nueva conexión establecida como id ' + connection.threadId);
});

pool.on('error', (err) => {
    console.error('Error en el pool de conexiones:', err.code);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reintentando conexión...');
    }
});

// Comentados para reducir logs - descomenta si necesitas más información
// pool.on('acquire', (connection) => {
//     console.log('Conexión %d adquirida', connection.threadId);
// });

pool.on('release', (connection) => {
    console.log('Conexión %d liberada', connection.threadId);
});

// Exportar pool principal (mantiene compatibilidad con tu código existente)
export default pool;