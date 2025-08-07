import disponibilidadCuposModel from '../models/disponibilidadCupos.js';

export const getDisponibilidadPorMes = async (req, res) => {
    try {
        const { year, mes } = req.params;
        
        if (!year || !mes || isNaN(Number(year)) || isNaN(Number(mes))) {
            return res.status(400).json({
                data: false,
                message: 'Año y mes son requeridos y deben ser números válidos',
                error: true
            });
        }

        if (Number(mes) < 1 || Number(mes) > 12) {
            return res.status(400).json({
                data: false,
                message: 'El mes debe estar entre 1 y 12',
                error: true
            });
        }

        const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorMes(
            Number(year), 
            Number(mes)
        );

        res.status(200).json({
            data: disponibilidad,
            message: `Disponibilidad de cupos para ${mes}/${year} obtenida correctamente`,
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad de cupos:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad de cupos',
            error: error.message
        });
    }
};

export const getDisponibilidadPorRango = async (req, res) => {
    try {
        const { yearInicio, mesInicio, yearFin, mesFin } = req.query;
        
        if (!yearInicio || !mesInicio || !yearFin || !mesFin) {
            return res.status(400).json({
                data: false,
                message: 'Se requieren yearInicio, mesInicio, yearFin, mesFin',
                error: true
            });
        }

        const disponibilidad = await disponibilidadCuposModel.getDisponibilidadPorRango(
            Number(yearInicio), 
            Number(mesInicio),
            Number(yearFin), 
            Number(mesFin)
        );

        res.status(200).json({
            data: disponibilidad,
            message: 'Disponibilidad de cupos por rango obtenida correctamente',
            error: false
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad de cupos por rango:', error);
        res.status(500).json({
            data: false,
            message: 'Error interno al obtener disponibilidad de cupos',
            error: error.message
        });
    }
};