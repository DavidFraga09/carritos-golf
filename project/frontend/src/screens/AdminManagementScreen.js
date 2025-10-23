import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API } from '../api/api';
import useAuth from '../hooks/useAuth';

const AdminManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/usuarios");
      setUsers(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      Alert.alert("❌ Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const promoteToAdmin = async (userId, userName) => {
    try {
      await API.put(`/usuarios/${userId}/role`, { rol: 'admin' });
      Alert.alert("✅ Éxito", `${userName} promovido a administrador`);
      fetchUsers();
    } catch (err) {
      console.error("Error al promover usuario:", err);
      Alert.alert("❌ Error", "No se pudo promover el usuario");
    }
  };

  const demoteToUser = async (userId, userName) => {
    try {
      await API.put(`/usuarios/${userId}/role`, { rol: 'user' });
      Alert.alert("✅ Éxito", `${userName} cambiado a usuario normal`);
      fetchUsers();
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      Alert.alert("❌ Error", "No se pudo cambiar el rol");
    }
  };

  const UserItem = ({ user }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Ionicons 
          name={user.rol === 'admin' ? "shield-checkmark" : "person"} 
          size={24} 
          color={user.rol === 'admin' ? '#1E3F20' : '#666'} 
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.nombre}</Text>
          <Text style={styles.userEmail}>{user.correo}</Text>
          <Text style={[
            styles.userRole,
            { color: user.rol === 'admin' ? '#1E3F20' : '#666' }
          ]}>
            {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {user.rol === 'user' ? (
          <TouchableOpacity 
            style={styles.promoteButton}
            onPress={() => 
              Alert.alert(
                "Promover a Administrador",
                `¿Estás seguro de promover a ${user.nombre} como administrador?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Promover", onPress: () => promoteToAdmin(user._id, user.nombre) }
                ]
              )
            }
          >
            <MaterialIcons name="admin-panel-settings" size={20} color="#fff" />
            <Text style={styles.buttonText}>Hacer Admin</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.demoteButton}
            onPress={() => 
              Alert.alert(
                "Quitar permisos de Admin",
                `¿Estás seguro de quitar los permisos de administrador a ${user.nombre}?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Quitar Admin", onPress: () => demoteToUser(user._id, user.nombre) }
                ]
              )
            }
          >
            <Ionicons name="person-remove" size={20} color="#fff" />
            <Text style={styles.buttonText}>Quitar Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.rol === 'admin').length,
    users: users.filter(u => u.rol === 'user').length
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3F20" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3F20" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity onPress={() => logout(navigation)} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E3F20"]}
          />
        }
      >
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.admins}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.users}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Lista de Usuarios</Text>
        
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <UserItem user={item} />}
          scrollEnabled={false}
        />
      </ScrollView>

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchUsers}
      >
        <Ionicons name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3F20',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3F20',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3F20',
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  actions: {
    marginLeft: 10,
  },
  promoteButton: {
    backgroundColor: '#1E3F20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoteButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default AdminManagementScreen;