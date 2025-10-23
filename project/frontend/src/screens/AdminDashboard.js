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

const COLORS = {
  PRIMARY: '#1E3F20', 
  SECONDARY: '#59775B', 
  ACCENT_PRIMARY: '#FFC107', 
  BACKGROUND: '#F5F5DC', 
  CARD_BG: '#FFFFFF',
  ALERT: '#F44336', 
  SUCCESS: '#8BC34A', 
  TEXT_DARK: '#333333', 
  TEXT_LIGHT: '#FFFFFF',
};

// Coordenadas para la geocerca
const RESORT_COORDS = { latitude: 20.695009, longitude: -87.029062 };
const GEOFENCE_COORDS = { latitude: 20.6965, longitude: -87.0295, radius: 200 };

// Componente de Tarjeta de Resumen
const SummaryCard = ({ icon, label, value, color }) => {
  const textColor = (color === COLORS.PRIMARY || color === COLORS.ALERT || color === COLORS.ACCENT_PRIMARY) ? COLORS.TEXT_LIGHT : COLORS.TEXT_DARK;

  return (
    <View style={[styles.summaryCard, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={28} color={textColor} />
      <Text style={[styles.summaryValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
};

// Indicador de Batería
const BatteryIndicator = ({ percentage }) => {
  let iconName;
  let color;

  if (percentage > 75) { 
    iconName = 'battery-full'; 
    color = COLORS.SUCCESS; 
  } else if (percentage > 50) { 
    iconName = 'battery-three-quarters'; 
    color = COLORS.SUCCESS; 
  } else if (percentage > 30) { 
    iconName = 'battery-half'; 
    color = COLORS.ACCENT_PRIMARY; 
  } else { 
    iconName = 'battery-quarter'; 
    color = COLORS.ALERT; 
  }

  return (
    <View style={styles.batteryContainer}>
      <Ionicons name={iconName} size={20} color={color} />
      <Text style={[styles.batteryText, { color }]}>{percentage}%</Text>
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

  useEffect(() => {
    fetchCarritos();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: selectedCart ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedCart, fadeAnim]);

  const fetchCarritos = async () => {
    try {
      const res = await API.get("/carritos");
      setCarritos(res.data);
    } catch (err) {
      console.error("Error al cargar carritos:", err.response?.data || err.message);
      Alert.alert("❌ Error", "No se pudieron cargar los carritos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCarritos();
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

  const handleSelectCart = (cart) => {
    setSelectedCart(cart._id === selectedCart?._id ? null : cart);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: cart.ubicacion_actual?.latitud || 20.6375,
        longitude: cart.ubicacion_actual?.longitud || -87.0702,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const metrics = useMemo(() => {
    const totalCarts = carritos.length;
    const availableCarts = carritos.filter(c => c.estado === "activo").length;
    const inUseCarts = carritos.filter(c => c.estado === "en_uso").length;
    const maintenanceCarts = carritos.filter(c => c.estado === "mantenimiento").length;
    const lowBatteryCarts = carritos.filter(c => c.bateria < 30).length;
    const avgBattery = Math.round(carritos.reduce((sum, cart) => sum + cart.bateria, 0) / (totalCarts || 1));

    return { totalCarts, availableCarts, inUseCarts, maintenanceCarts, lowBatteryCarts, avgBattery };
  }, [carritos]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando carritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="car-sport" size={32} color={COLORS.PRIMARY} />
          <Text style={styles.headerTitle}>Panel de Administración</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.ALERT} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
      >
        {/* Resumen de KPIs */}
        <View style={styles.summaryContainer}>
          <SummaryCard icon="directions-car" label="Total" value={metrics.totalCarts} color={COLORS.PRIMARY} />
          <SummaryCard icon="check-circle" label="Disponibles" value={metrics.availableCarts} color={COLORS.SUCCESS} />
          <SummaryCard icon="warning" label="Batería Baja" value={metrics.lowBatteryCarts} color={COLORS.ALERT} />
        </View>

        {/* Botón de Gestión de Usuarios */}
        <TouchableOpacity 
          style={styles.managementButton}
          onPress={() => navigation.navigate("AdminManagement")}
        >
          <Ionicons name="people" size={20} color="#fff" />
          <Text style={styles.managementButtonText}>Gestionar Usuarios</Text>
        </TouchableOpacity>

        {/* Mapa */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Ubicación en Tiempo Real</Text>
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
            {/* Geocerca */}
            <Circle
              center={GEOFENCE_COORDS}
              radius={GEOFENCE_COORDS.radius}
              strokeWidth={2}
              strokeColor={COLORS.ALERT}
              fillColor={COLORS.ALERT + '20'}
            />

            {/* Marcadores de carritos */}
            {carritos.map((cart) => (
              <Marker
                key={cart._id}
                coordinate={{
                  latitude: cart.ubicacion_actual?.latitud || 20.6375,
                  longitude: cart.ubicacion_actual?.longitud || -87.0702,
                }}
                title={cart.identificador}
                description={`Batería: ${cart.bateria}% | Estado: ${cart.estado}`}
                pinColor={
                  cart.estado === "activo" ? "green" : 
                  cart.estado === "en_uso" ? "blue" : 
                  cart.bateria < 30 ? "red" : "orange"
                }
                onPress={() => handleSelectCart(cart)}
              />
            ))}
          </MapView>

          {/* Tarjeta de detalles del carrito seleccionado */}
          {selectedCart && (
            <Animated.View style={[styles.detailCard, { opacity: fadeAnim }]}>
              <View style={styles.detailCardHeader}>
                <Text style={styles.detailCardTitle}>{selectedCart.identificador}</Text>
                <TouchableOpacity onPress={() => setSelectedCart(null)}>
                  <Ionicons name="close" size={24} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
              <View style={styles.detailCardBody}>
                <Text style={styles.detailText}>Modelo: {selectedCart.modelo}</Text>
                <Text style={styles.detailText}>Estado: {selectedCart.estado}</Text>
                <BatteryIndicator percentage={selectedCart.bateria} />
              </View>
            </Animated.View>
          )}
        </View>

        {/* Lista de carritos */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Gestión de Carritos ({carritos.length})</Text>
          <FlatList
            data={carritos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.cartCard,
                  selectedCart?._id === item._id && styles.cartCardSelected
                ]}
                onPress={() => handleSelectCart(item)}
              >
                <View style={styles.cartCardLeft}>
                  <View style={[
                    styles.cartIcon,
                    { backgroundColor: 
                      item.estado === "activo" ? COLORS.SUCCESS : 
                      item.estado === "en_uso" ? COLORS.ACCENT_PRIMARY : COLORS.ALERT 
                    }
                  ]}>
                    <FontAwesome5 name="car" size={16} color={COLORS.TEXT_LIGHT} />
                  </View>
                  <View>
                    <Text style={styles.cartId}>{item.identificador}</Text>
                    <Text style={styles.cartInfo}>Estado: {item.estado}</Text>
                  </View>
                </View>
                <View style={styles.cartCardRight}>
                  {item.bateria < 30 && (
                    <Ionicons name="warning" size={20} color={COLORS.ALERT} />
                  )}
                  <BatteryIndicator percentage={item.bateria} />
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Botón de actualizar */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchCarritos}>
        <Ionicons name="refresh" size={24} color={COLORS.TEXT_LIGHT} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5DC' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    color: '#59775B'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3F20',
    marginLeft: 10,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  scrollViewContent: {
    padding: 15,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  managementButton: {
    backgroundColor: '#1E3F20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#1E3F20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  managementButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3F20',
    marginBottom: 10,
  },
  mapContainer: {
    marginBottom: 20,
  },
  map: {
    height: 250,
    borderRadius: 12,
  },
  detailCard: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3F20',
  },
  detailCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
  },
  listContainer: {
    marginBottom: 20,
  },
  cartCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartCardSelected: {
    borderWidth: 2,
    borderColor: '#1E3F20',
  },
  cartCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cartId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3F20',
  },
  cartInfo: {
    fontSize: 12,
    color: '#59775B',
    marginTop: 2,
  },
  cartCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1E3F20',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3F20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default AdminDashboard;