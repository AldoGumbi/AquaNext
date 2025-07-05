import { createSlice } from '@reduxjs/toolkit';
import {
  addGrupoThunk,
  getGruposThunk,
  getGruposConHorariosThunk,
  getGruposPorTipoThunk,
  updateGrupoThunk,
  deleteGrupoThunk
} from "./thunk.js";

const initialState = {
	grupos: [],
	gruposConHorarios: [],
	loading: false,
	error: false,
	error_message: "",
}

const gruposSlice = createSlice({
	name: "global_state_grupos",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
    // INSERT GRUPO
    builder.addCase(addGrupoThunk.fulfilled, (state, action) => {
      state.grupos.push(action.payload);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(addGrupoThunk.rejected, (state, action) => {
      console.log("Error 500 al insertar el grupo, reducer.js: ", action.payload.error);
      state.loading = false;
      state.error_message = action.payload.error.API_message || action.payload.error.message || "Error al insertar el grupo";
      state.error = true;
    });
    builder.addCase(addGrupoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET ALL GRUPOS
    builder.addCase(getGruposThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.grupos = action.payload;
    });
    builder.addCase(getGruposThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error.API_message || action.payload.error.message || "Error al obtener los grupos";
      state.error = true;
    });
    builder.addCase(getGruposThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET ALL GRUPOS CON HORARIOS
    builder.addCase(getGruposConHorariosThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.gruposConHorarios = action.payload;
    });
    builder.addCase(getGruposConHorariosThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error.API_message || action.payload.error.message || "Error al obtener los grupos con horarios";
      state.error = true;
    });
    builder.addCase(getGruposConHorariosThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET GRUPOS POR TIPO
    builder.addCase(getGruposPorTipoThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.grupos = action.payload;
    });
    builder.addCase(getGruposPorTipoThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error.API_message || action.payload.error.message || "Error al obtener los grupos por tipo";
      state.error = true;
    });
    builder.addCase(getGruposPorTipoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // EDIT GRUPO
    builder.addCase(updateGrupoThunk.fulfilled, (state, action) => {
      const index = state.grupos.findIndex(grupo => grupo.id === action.payload.id);
      if (index !== -1) {
        state.grupos[index] = action.payload;
      }
      state.loading = false;
      state.error = false;
    });
    builder.addCase(updateGrupoThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error.API_message || action.payload.error.message || "Error al editar el grupo";
      state.error = true;
    });
    builder.addCase(updateGrupoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // DELETE GRUPO
    builder.addCase(deleteGrupoThunk.fulfilled, (state, action) => {
      state.grupos = state.grupos.filter(grupo => grupo.id !== action.payload);
      state.gruposConHorarios = state.gruposConHorarios.filter(grupo => grupo.id !== action.payload);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(deleteGrupoThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error.API_message || action.payload.error.message || "Error al eliminar el grupo";
      state.error = true;
    });
    builder.addCase(deleteGrupoThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });
  }
})

export default gruposSlice.reducer;