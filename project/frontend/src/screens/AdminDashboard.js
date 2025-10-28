import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Animated 
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { API } from "../api/api";
import useAuth from "../hooks/useAuth";

// 🎨 Paleta premium estilo resort
const COLORS = {
  PRIMARY: "#204D45",
  SECONDARY: "#77A89A",
  ACCENT: "#F6C945",
  BACKGROUND: "#F2EFE7",
  CARD: "#FFFFFF",
  DANGER: "#D9534F",
  SUCCESS: "#7CB342",
  TEXT: "#2A2A2A",
  LIGHT_TEXT: "#FFFFFF",
  BORDER: "#DFDCCE",
  SHADOW: "rgba(0,0,0,0.12)",
};

// Coordenadas
const GEOFENCE_COORDS = { latitude: 20.6965, longitude: -87.0295, radius: 200 };

const SummaryCard = ({ icon, label, value }) => (
  <View style={styles.summaryCard}>
    <MaterialIcons name={icon} size={28} color={COLORS.PRIMARY} />
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const BatteryIndicator = ({ percentage }) => {
  let icon = "battery-half";
  let color = COLORS.SUCCESS;

  if (percentage <= 30) { icon = "battery-quarter"; color = COLORS.DANGER; }
  if (percentage > 50) { icon = "battery-three-quarters"; }
  if (percentage > 75) { icon = "battery-full"; }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ marginLeft: 4, fontWeight: "700", color }}>{percentage}%</Text>
    </View>
  );
};

const AdminDashboard = ({ navigation }) => {
  const [carritos, setCarritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const { logout } = useAuth();
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchCarritos(); }, []);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: selectedCart ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedCart]);

  const fetchCarritos = async () => {
    try {
      const res = await API.get("/carritos");
      setCarritos(res.data);
    } catch (err) {
      Alert.alert("❌ Error", "No se pudieron cargar los carritos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const metrics = useMemo(() => ({
    total: carritos.length,
    disponibles: carritos.filter(c => c.estado === "activo").length,
    bateriaBaja: carritos.filter(c => c.bateria < 30).length,
  }), [carritos]);

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={{ marginTop: 10 }}>Cargando carritos...</Text>
    </View>
  );

  const onSelectCart = (cart) => {
    setSelectedCart(selectedCart?._id === cart._id ? null : cart);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: cart.ubicacion_actual?.latitud || 20.6375,
        longitude: cart.ubicacion_actual?.longitud || -87.0702,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }, 800);
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="car-sport" size={32} color={COLORS.LIGHT_TEXT} />
          <Text style={styles.headerTitle}>Panel de Administración</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => logout(navigation)}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.LIGHT_TEXT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCarritos(); }} />}
      >

        {/* KPIs */}
        <View style={styles.summaryContainer}>
          <SummaryCard icon="directions-car" label="Total" value={metrics.total} />
          <SummaryCard icon="check-circle" label="Disponibles" value={metrics.disponibles} />
          <SummaryCard icon="warning" label="Batería Baja" value={metrics.bateriaBaja} />
        </View>

        {/* Botón Gestión */}
        <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate("AdminManagement")}>
          <Ionicons name="people" size={20} color={COLORS.LIGHT_TEXT} />
          <Text style={styles.managementButtonText}>Gestionar Usuarios</Text>
        </TouchableOpacity>

        {/* MAPA */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 20.6375,
              longitude: -87.0702,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Circle
              center={GEOFENCE_COORDS}
              radius={GEOFENCE_COORDS.radius}
              strokeColor={COLORS.DANGER}
              fillColor={COLORS.DANGER + "33"}
            />
            {carritos.map((cart) => (
              <Marker
                key={cart._id}
                coordinate={{
                  latitude: cart.ubicacion_actual?.latitud || 20.6375,
                  longitude: cart.ubicacion_actual?.longitud || -87.0702,
                }}
                title={cart.identificador}
                onPress={() => onSelectCart(cart)}
              />
            ))}
          </MapView>

          {selectedCart && (
            <Animated.View style={[styles.detailCard, { opacity: fadeAnim }]}>
              <Text style={styles.detailCardTitle}>{selectedCart.identificador}</Text>
              <Text>Estado: {selectedCart.estado}</Text>
              <BatteryIndicator percentage={selectedCart.bateria} />
            </Animated.View>
          )}
        </View>

        {/* LISTA */}
        <FlatList
          data={carritos}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectCart(item)} style={[styles.cartCard, selectedCart?._id === item._id && styles.cartCardSelected]}>
              <View>
                <Text style={styles.cartId}>{item.identificador}</Text>
                <Text style={styles.cartInfo}>Estado: {item.estado}</Text>
              </View>
              <BatteryIndicator percentage={item.bateria} />
            </TouchableOpacity>
          )}
        />

      </ScrollView>

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchCarritos}>
        <Ionicons name="refresh" size={26} color={COLORS.LIGHT_TEXT} />
      </TouchableOpacity>

    </View>
  );
};

// 🎨 ESTILOS MEJORADOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50, paddingBottom: 18, paddingHorizontal: 20,
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    elevation: 10
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.LIGHT_TEXT, marginLeft: 10 },
  logoutButton: { padding: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12 },

  scrollViewContent: { padding: 20 },

  summaryContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.CARD, paddingVertical: 18, borderRadius: 18,
    alignItems: "center", marginHorizontal: 5, borderWidth: 1, borderColor: COLORS.BORDER,
    shadowColor: COLORS.SHADOW, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  summaryValue: { fontSize: 22, fontWeight: "800", color: COLORS.TEXT, marginTop: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.SECONDARY, marginTop: 2 },

  managementButton: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    backgroundColor: COLORS.PRIMARY, paddingVertical: 14, borderRadius: 16,
    elevation: 5, marginBottom: 16
  },
  managementButtonText: { color: COLORS.LIGHT_TEXT, marginLeft: 8, fontWeight: "700", fontSize: 16 },

  mapContainer: {
    backgroundColor: COLORS.CARD, padding: 10, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.BORDER,
    shadowColor: COLORS.SHADOW, shadowOpacity: 0.12, shadowRadius: 10,
    elevation: 5, marginBottom: 25,
  },
  map: { height: 260, borderRadius: 15 },

  detailCard: {
    position: "absolute", bottom: 12, left: 12, right: 12,
    backgroundColor: COLORS.CARD, padding: 16, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.BORDER, elevation: 8
  },
  detailCardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: COLORS.TEXT },

  cartCard: {
    flexDirection: "row", justifyContent: "space-between",
    backgroundColor: COLORS.CARD, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.BORDER,
    marginBottom: 8, elevation: 2
  },
  cartCardSelected: { borderColor: COLORS.PRIMARY, borderWidth: 2 },
  cartId: { fontSize: 16, fontWeight: "700", color: COLORS.TEXT },
  cartInfo: { color: COLORS.SECONDARY, marginTop: 2 },

  refreshButton: {
    position: "absolute", bottom: 28, right: 20,
    backgroundColor: COLORS.PRIMARY, width: 62, height: 62, borderRadius: 31,
    justifyContent: "center", alignItems: "center", elevation: 8,
  },
});

export default AdminDashboard;
