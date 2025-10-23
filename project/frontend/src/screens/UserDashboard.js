import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView 
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { API } from "../api/api";
import useAuth from "../hooks/useAuth";

export default function UserDashboard({ navigation }) {
  const [carritoAsignado, setCarritoAsignado] = useState(null);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const solicitarCarrito = async () => {
    try {
      setLoading(true);
      const res = await API.get("/carritos");
      const disponibles = res.data.filter((c) => c.estado === "activo" && c.bateria > 10);

      if (disponibles.length === 0) {
        Alert.alert("Sin disponibilidad", "No hay carritos activos con batería suficiente en este momento.");
        return;
      }

      // Seleccionar el carrito con mayor batería
      const carrito = disponibles.sort((a, b) => b.bateria - a.bateria)[0];
      setCarritoAsignado(carrito);
      
      Alert.alert(
        "Carrito asignado", 
        `Te asignamos el carrito ${carrito.identificador}\nBatería: ${carrito.bateria}%`
      );
    } catch (err) {
      console.error("Error solicitando carrito:", err.message);
      Alert.alert("Error", "No se pudo asignar un carrito. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const liberarCarrito = () => {
    Alert.alert(
      "Liberar carrito",
      "¿Estás seguro de que quieres liberar el carrito?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, liberar", 
          onPress: () => {
            setCarritoAsignado(null);
            Alert.alert("Carrito liberado", "El carrito ha sido liberado exitosamente");
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, cerrar", onPress: () => logout(navigation) }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bienvenido al Sistema de Carritos</Text>

      {carritoAsignado ? (
        <>
          <Text style={styles.subtitle}>Tu carrito asignado:</Text>
          <View style={styles.card}>
            <Text style={styles.carritoId}>ID: {carritoAsignado.identificador}</Text>
            <Text>Modelo: {carritoAsignado.modelo}</Text>
            <Text style={[
              styles.battery,
              carritoAsignado.bateria < 20 && styles.batteryLow
            ]}>
              Batería: {carritoAsignado.bateria}%
            </Text>
            <Text style={[
              styles.status,
              carritoAsignado.estado === "activo" ? styles.statusActive : styles.statusInactive
            ]}>
              Estado: {carritoAsignado.estado}
            </Text>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: carritoAsignado.ubicacion_actual?.latitud || 20.6375,
              longitude: carritoAsignado.ubicacion_actual?.longitud || -87.0702,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker
              coordinate={{
                latitude: carritoAsignado.ubicacion_actual?.latitud || 20.6375,
                longitude: carritoAsignado.ubicacion_actual?.longitud || -87.0702,
              }}
              title={carritoAsignado.identificador}
              description={`Batería: ${carritoAsignado.bateria}% | Estado: ${carritoAsignado.estado}`}
              pinColor="blue"
            />
          </MapView>

          <TouchableOpacity style={styles.liberarBtn} onPress={liberarCarrito}>
            <Text style={styles.btnText}>Liberar Carrito</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.noCarritoContainer}>
          <Text style={styles.noCarritoText}>No tienes un carrito asignado</Text>
          <TouchableOpacity 
            style={styles.btn} 
            onPress={solicitarCarrito} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Solicitar Carrito</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f7f7f7", 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center",
    color: "#1E3F20"
  },
  subtitle: { 
    fontSize: 18, 
    marginBottom: 15, 
    textAlign: "center",
    fontWeight: "600"
  },
  noCarritoContainer: {
    alignItems: "center",
    marginVertical: 30
  },
  noCarritoText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20
  },
  map: { 
    height: 250, 
    marginVertical: 15, 
    borderRadius: 12 
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carritoId: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1E3F20",
    marginBottom: 5
  },
  battery: {
    fontWeight: "600"
  },
  batteryLow: {
    color: "orange"
  },
  status: {
    fontWeight: "600"
  },
  statusActive: {
    color: "green"
  },
  statusInactive: {
    color: "red"
  },
  btn: { 
    backgroundColor: "#1E3F20", 
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center", 
    width: "100%",
    marginVertical: 10
  },
  liberarBtn: {
    backgroundColor: "#e67e22",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16
  },
  logoutBtn: {
    backgroundColor: "#c0392b",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10
  },
  logoutText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16
  },
});