// slices/inscripcionesSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
    createInscripcionSolaThunk,
    createMensualidadSolaThunk,
    createInscripcionConMensualidadesThunk,
    getAllInscripcionesThunk,
    getInscripcionesByAlumnoThunk,
    validateInscripcionVigenteThunk,
    getMensualidadesByAlumnoThunk,
    getMensualidadesByInscripcionThunk,
    cancelarInscripcionThunk,
    cancelarMensualidadThunk,
    getEstadisticasInscripcionesThunk,
    getTarifasMensualidadThunk,
    createTarifaMensualidadThunk,
    updateTarifaMensualidadThunk,
    deleteTarifaMensualidadThunk
} from './thunk';

const initialState = {
    // Estados de carga
    loading: false,
    inscripcionLoading: false,
    mensualidadLoading: false,
    estadisticasLoading: false,
    
    // Estados de error
    error: false,
    error_message: null,
    
    // Datos principales
    inscripciones: [],
    mensualidades: [],
    inscripcionActual: null,
    mensualidadActual: null,
    tarifas: [],
    
    // Validaciones
    inscripcionVigente: null,
    tieneInscripcionVigente: false,
    
    // Estadísticas
    estadisticas: {
        general: {},
        por_mes: [],
        por_tipo: []
    },
    
    // Paginación
    pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    },
    
    // Filtros
    filters: {
        alumno_nombre: '',
        year: null,
        mes: null,
        incluir_canceladas: false
    },
    
    // Estados de operaciones
    operationSuccess: false,
    operationMessage: '',
    
    // Última transacción creada
    ultimaTransaccion: null
    
};

const inscripcionesSlice = createSlice({
    name: 'inscripciones',
    initialState,
    reducers: {
        // Limpiar errores
        clearError: (state) => {
            state.error = false;
            state.error_message = null;
        },
        
        // Limpiar operación exitosa
        clearOperationSuccess: (state) => {
            state.operationSuccess = false;
            state.operationMessage = '';
        },
        
        // Establecer filtros
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Limpiar filtros
        clearFilters: (state) => {
            state.filters = {
                alumno_nombre: '',
                year: null,
                mes: null,
                incluir_canceladas: false
            };
        },
        
        // Establecer inscripción actual
        setInscripcionActual: (state, action) => {
            state.inscripcionActual = action.payload;
        },
        
        // Establecer mensualidad actual
        setMensualidadActual: (state, action) => {
            state.mensualidadActual = action.payload;
        },
        
        // Limpiar estados
        clearStates: (state) => {
            state.inscripciones = [];
            state.mensualidades = [];
            state.inscripcionActual = null;
            state.mensualidadActual = null;
            state.inscripcionVigente = null;
            state.tieneInscripcionVigente = false;
            state.ultimaTransaccion = null;
        },
        
        // Actualizar inscripción en la lista
        updateInscripcionInList: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.inscripciones.findIndex(inscripcion => inscripcion.id === id);
            if (index !== -1) {
                state.inscripciones[index] = { ...state.inscripciones[index], ...updates };
            }
        },
        
        // Actualizar mensualidad en la lista
        updateMensualidadInList: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.mensualidades.findIndex(mensualidad => mensualidad.id === id);
            if (index !== -1) {
                state.mensualidades[index] = { ...state.mensualidades[index], ...updates };
            }
        }
    },
    extraReducers: (builder) => {
        // ============ CREAR INSCRIPCIÓN SOLA ============
        builder
            .addCase(createInscripcionSolaThunk.pending, (state) => {
                state.inscripcionLoading = true;
                state.error = false;
                state.error_message = null;
                state.operationSuccess = false;
            })
            .addCase(createInscripcionSolaThunk.fulfilled, (state, action) => {
                state.inscripcionLoading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Inscripción creada exitosamente';
                state.ultimaTransaccion = action.payload;
                
                // Actualizar estado de inscripción vigente si es para el mismo alumno
                if (state.inscripcionVigente && state.inscripcionVigente.alumno_id === action.meta.arg.alumno_id) {
                    state.tieneInscripcionVigente = true;
                }
            })
            .addCase(createInscripcionSolaThunk.rejected, (state, action) => {
                state.inscripcionLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al crear inscripción';
                state.operationSuccess = false;
            });

        // ============ CREAR MENSUALIDAD SOLA ============
        builder
            .addCase(createMensualidadSolaThunk.pending, (state) => {
                state.mensualidadLoading = true;
                state.error = false;
                state.error_message = null;
                state.operationSuccess = false;
            })
            .addCase(createMensualidadSolaThunk.fulfilled, (state, action) => {
                state.mensualidadLoading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Mensualidades creadas exitosamente';
                state.ultimaTransaccion = action.payload;
            })
            .addCase(createMensualidadSolaThunk.rejected, (state, action) => {
                state.mensualidadLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al crear mensualidades';
                state.operationSuccess = false;
            });

        // ============ CREAR INSCRIPCIÓN CON MENSUALIDADES ============
        builder
            .addCase(createInscripcionConMensualidadesThunk.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.error_message = null;
                state.operationSuccess = false;
            })
            .addCase(createInscripcionConMensualidadesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Inscripción y mensualidades creadas exitosamente';
                state.ultimaTransaccion = action.payload;
                
                // Actualizar estado de inscripción vigente
                state.tieneInscripcionVigente = true;
            })
            .addCase(createInscripcionConMensualidadesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al crear inscripción con mensualidades';
                state.operationSuccess = false;
            });

        // ============ OBTENER TODAS LAS INSCRIPCIONES ============
        builder
            .addCase(getAllInscripcionesThunk.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(getAllInscripcionesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.inscripciones = action.payload.data.inscripciones || [];
                state.pagination = action.payload.data.pagination || state.pagination;
            })
            .addCase(getAllInscripcionesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al obtener inscripciones';
            });

        // ============ OBTENER INSCRIPCIONES POR ALUMNO ============
        builder
            .addCase(getInscripcionesByAlumnoThunk.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(getInscripcionesByAlumnoThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.inscripciones = action.payload.data || [];
            })
            .addCase(getInscripcionesByAlumnoThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al obtener inscripciones del alumno';
            });

        // ============ VALIDAR INSCRIPCIÓN VIGENTE ============
        builder
            .addCase(validateInscripcionVigenteThunk.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(validateInscripcionVigenteThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.tieneInscripcionVigente = action.payload.tiene_inscripcion_vigente;
                state.inscripcionVigente = action.payload.inscripcion;
            })
            .addCase(validateInscripcionVigenteThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al validar inscripción';
                state.tieneInscripcionVigente = false;
                state.inscripcionVigente = null;
            });

        // ============ OBTENER MENSUALIDADES POR ALUMNO ============
        builder
            .addCase(getMensualidadesByAlumnoThunk.pending, (state) => {
                state.mensualidadLoading = true;
                state.error = false;
            })
            .addCase(getMensualidadesByAlumnoThunk.fulfilled, (state, action) => {
                state.mensualidadLoading = false;
                state.error = false;
                state.mensualidades = action.payload.data || [];
            })
            .addCase(getMensualidadesByAlumnoThunk.rejected, (state, action) => {
                state.mensualidadLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al obtener mensualidades del alumno';
            });

        // ============ OBTENER MENSUALIDADES POR INSCRIPCIÓN ============
        builder
            .addCase(getMensualidadesByInscripcionThunk.pending, (state) => {
                state.mensualidadLoading = true;
                state.error = false;
            })
            .addCase(getMensualidadesByInscripcionThunk.fulfilled, (state, action) => {
                state.mensualidadLoading = false;
                state.error = false;
                state.mensualidades = action.payload.data || [];
            })
            .addCase(getMensualidadesByInscripcionThunk.rejected, (state, action) => {
                state.mensualidadLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al obtener mensualidades de la inscripción';
            });

        // ============ CANCELAR INSCRIPCIÓN ============
        builder
            .addCase(cancelarInscripcionThunk.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.operationSuccess = false;
            })
            .addCase(cancelarInscripcionThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Inscripción cancelada exitosamente';
                
                // Actualizar inscripción en la lista
                const inscripcionId = action.meta.arg.inscripcionId;
                const index = state.inscripciones.findIndex(ins => ins.id === parseInt(inscripcionId));
                if (index !== -1) {
                    state.inscripciones[index].activa = false;
                    state.inscripciones[index].estado_inscripcion = 'CANCELADA';
                }
                
                // Si es la inscripción vigente, actualizar estado
                if (state.inscripcionVigente && state.inscripcionVigente.id === parseInt(inscripcionId)) {
                    state.tieneInscripcionVigente = false;
                    state.inscripcionVigente = null;
                }
            })
            .addCase(cancelarInscripcionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al cancelar inscripción';
                state.operationSuccess = false;
            });

        // ============ CANCELAR MENSUALIDAD ============
        builder
            .addCase(cancelarMensualidadThunk.pending, (state) => {
                state.mensualidadLoading = true;
                state.error = false;
                state.operationSuccess = false;
            })
            .addCase(cancelarMensualidadThunk.fulfilled, (state, action) => {
                state.mensualidadLoading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Mensualidad cancelada exitosamente';
                
                // Actualizar mensualidad en la lista
                const mensualidadId = action.meta.arg.mensualidadId;
                const index = state.mensualidades.findIndex(mens => mens.id === parseInt(mensualidadId));
                if (index !== -1) {
                    state.mensualidades[index].pagada = false;
                    state.mensualidades[index].estado_mensualidad = 'CANCELADA';
                }
            })
            .addCase(cancelarMensualidadThunk.rejected, (state, action) => {
                state.mensualidadLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al cancelar mensualidad';
                state.operationSuccess = false;
            });

        // ============ OBTENER ESTADÍSTICAS ============
        builder
            .addCase(getEstadisticasInscripcionesThunk.pending, (state) => {
                state.estadisticasLoading = true;
                state.error = false;
            })
            .addCase(getEstadisticasInscripcionesThunk.fulfilled, (state, action) => {
                state.estadisticasLoading = false;
                state.error = false;
                state.estadisticas = action.payload.data || state.estadisticas;
            })
            .addCase(getEstadisticasInscripcionesThunk.rejected, (state, action) => {
                state.estadisticasLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al obtener estadísticas';
            });

        // ============ OBTENER TARIFAS ============
        builder
            .addCase(getTarifasMensualidadThunk.pending, (state) => {
                state.tarifasLoading = true;
                state.error = false;
            })
            .addCase(getTarifasMensualidadThunk.fulfilled, (state, action) => {
                state.tarifasLoading = false;
                state.error = false;
                state.tarifas = action.payload || [];
            })
            .addCase(getTarifasMensualidadThunk.rejected, (state, action) => {
                state.tarifasLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al obtener tarifas';
            });

        // ============ CREAR TARIFA ============
        builder
            .addCase(createTarifaMensualidadThunk.pending, (state) => {
                state.tarifasLoading = true;
                state.error = false;
                state.operationSuccess = false;
            })
            .addCase(createTarifaMensualidadThunk.fulfilled, (state, action) => {
                state.tarifasLoading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Tarifa creada exitosamente';
                
                // Agregar nueva tarifa a la lista
                state.tarifas.push(action.payload);
            })
            .addCase(createTarifaMensualidadThunk.rejected, (state, action) => {
                state.tarifasLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al crear tarifa';
                state.operationSuccess = false;
            });

        // ============ ACTUALIZAR TARIFA ============
        builder
            .addCase(updateTarifaMensualidadThunk.pending, (state) => {
                state.tarifasLoading = true;
                state.error = false;
                state.operationSuccess = false;
            })
            .addCase(updateTarifaMensualidadThunk.fulfilled, (state, action) => {
                state.tarifasLoading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Tarifa actualizada exitosamente';
                
                // Actualizar tarifa en la lista
                const index = state.tarifas.findIndex(tarifa => tarifa.id === action.payload.id);
                if (index !== -1) {
                    state.tarifas[index] = action.payload;
                }
            })
            .addCase(updateTarifaMensualidadThunk.rejected, (state, action) => {
                state.tarifasLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al actualizar tarifa';
                state.operationSuccess = false;
            });

        // ============ ELIMINAR TARIFA ============
        builder
            .addCase(deleteTarifaMensualidadThunk.pending, (state) => {
                state.tarifasLoading = true;
                state.error = false;
                state.operationSuccess = false;
            })
            .addCase(deleteTarifaMensualidadThunk.fulfilled, (state, action) => {
                state.tarifasLoading = false;
                state.error = false;
                state.operationSuccess = true;
                state.operationMessage = 'Tarifa eliminada exitosamente';
                
                // Remover tarifa de la lista
                const tarifaId = action.payload;
                state.tarifas = state.tarifas.filter(tarifa => tarifa.id !== tarifaId);
            })
            .addCase(deleteTarifaMensualidadThunk.rejected, (state, action) => {
                state.tarifasLoading = false;
                state.error = true;
                state.error_message = action.payload?.message || 'Error al eliminar tarifa';
                state.operationSuccess = false;
            });
    }
});

export const {
    clearError,
    clearOperationSuccess,
    setFilters,
    clearFilters,
    setInscripcionActual,
    setMensualidadActual,
    clearStates,
    updateInscripcionInList,
    updateMensualidadInList
} = inscripcionesSlice.actions;

export default inscripcionesSlice.reducer;