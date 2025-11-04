import express from "express";
import { getAccesoAlumnoById } from "../controllers/acceso-alumnos-controller.js";

const router = express.Router();

// Obtener información de acceso de un alumno por ID/credencial
router.get("/student/:id", getAccesoAlumnoById);

export default router;
