import express from "express";
import cors from "cors";
import carritoRoutes from "./routes/carritoRoutes.js";
import ubicacionRoutes from "./routes/ubicacionRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/carritos", carritoRoutes);
app.use("/api/ubicaciones", ubicacionRoutes);
app.use("/api/usuarios", usuarioRoutes);

export default app;
