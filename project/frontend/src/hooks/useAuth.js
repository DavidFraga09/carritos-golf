import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../api/api";
import { Alert } from "react-native";

export default function useAuth() {
  const [loading, setLoading] = useState(false);

  // Registro de usuario (por defecto rol "usuario")
  const register = async (nombre, correo, password, rol = "usuario") => {
    try {
      setLoading(true);
      const res = await API.post("/usuarios/register", { 
        nombre, 
        correo, 
        password, 
        rol // <- ya no está forzado, por si luego agregas otro tipo
      });
      Alert.alert("✅ Registro exitoso", "Usuario creado correctamente");
      return true;
    } catch (err) {
      console.error("Error en registro:", err.response?.data || err.message);
      Alert.alert(
        "❌ Error en registro", 
        err.response?.data?.message || "No se pudo registrar el usuario"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (loginData) => {
    try {
      setLoading(true);
      const res = await API.post("/usuarios/login", loginData);
      const user = res.data.user;

      // Guardar token y usuario
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert("🎉 Bienvenido", `Hola ${user.nombre}`);

      // Retornar la ruta según rol
      if (user.rol === "admin") {
        return "AdminDashboard";
      } else {
        return "UserDashboard";
      }
    } catch (err) {
      console.error("Error en login:", err.response?.data || err.message);
      Alert.alert(
        "❌ Error en login", 
        err.response?.data?.message || "Credenciales incorrectas"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async (navigation) => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      navigation.replace("Login");
    } catch (err) {
      console.error("Error en logout:", err);
    }
  };

  return { loading, register, login, logout };
}
