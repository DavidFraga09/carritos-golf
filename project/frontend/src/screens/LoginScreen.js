import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import useAuth from '../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
  const { login, loading } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("usuario");
  const animatedValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(animatedValue, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(animatedValue, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("❌ Error", "Por favor completa todos los campos");
      return;
    }

    const loginData = { correo, password, rol: selectedRole };
    const route = await login(loginData);

    if (route) {
      console.log("Login exitoso, redirigiendo a:", route);
      navigation.replace(route); // ✅ redirección automática
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" backgroundColor="#1E3F20" />
      
      {/* Fondo */}
      <Image 
        source={require("../../assets/maya.jpg")} 
        style={styles.backgroundImage} 
      />

      <View style={styles.loginContainer}>
        {/* Logo */}
        <Image 
          source={require("../../assets/alila-logo.png")} 
          style={styles.logo} 
        />
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para encontrar tu carrito de golf.</Text>

        {/* Selector de Rol (alineado y simple) */}
        <Text style={styles.roleLabel}>Selecciona tu tipo de usuario:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[
              styles.roleButton,
              selectedRole === "usuario" && styles.roleButtonActive
            ]}
            onPress={() => setSelectedRole("usuario")}
          >
            <Ionicons name="person-outline" size={22} color={selectedRole === "usuario" ? "#fff" : "#1E3F20"} />
            <Text style={[
              styles.roleButtonText,
              selectedRole === "usuario" && styles.roleButtonTextActive
            ]}>Usuario</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.roleButton,
              selectedRole === "admin" && styles.roleButtonActive
            ]}
            onPress={() => setSelectedRole("admin")}
          >
            <MaterialIcons name="admin-panel-settings" size={22} color={selectedRole === "admin" ? "#fff" : "#1E3F20"} />
            <Text style={[
              styles.roleButtonText,
              selectedRole === "admin" && styles.roleButtonTextActive
            ]}>Administrador</Text>
          </TouchableOpacity>
        </View>

        {/* Campo de correo */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail" size={20} color="#1E3F20" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Correo electrónico" 
            placeholderTextColor="#777" 
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        {/* Campo de contraseña */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={20} color="#1E3F20" style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Contraseña" 
            placeholderTextColor="#777" 
            secureTextEntry={!showPassword} 
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.togglePassword}
            disabled={loading}
          >
            <Ionicons 
              name={showPassword ? "eye" : "eye-off"} 
              size={20} 
              color="#1E3F20" 
            />
          </TouchableOpacity>
        </View>

        {/* Botón de Entrar */}
        <Animated.View style={{ width: '100%', transform: [{ scale: animatedValue }] }}>
          <TouchableOpacity 
            style={[
              styles.button, 
              (!correo || !password || loading) && styles.buttonDisabled
            ]} 
            onPress={handleLogin} 
            onPressIn={onPressIn} 
            onPressOut={onPressOut}
            disabled={!correo || !password || loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Cargando...</Text>
            ) : (
              <Text style={styles.buttonText}>
                Entrar como {selectedRole === "admin" ? "Administrador" : "Usuario"}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Enlace para registrarse */}
        <View style={styles.links}>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>¿No tienes una cuenta? Regístrate aquí.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// === ESTILOS ===
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#1E3F20' 
  },
  backgroundImage: { 
    ...StyleSheet.absoluteFillObject, 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover', 
    opacity: 0.5 
  },
  loginContainer: { 
    backgroundColor: 'rgba(225, 222, 217, 0.85)', 
    width: '90%', 
    maxWidth: 400, 
    padding: 30, 
    borderRadius: 12, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 10 
  },
  logo: { 
    width: 150, 
    height: 50, 
    resizeMode: 'contain', 
    marginBottom: 25 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1E3F20' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#59775B', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3F20',
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1E3F20',
    marginHorizontal: 5
  },
  roleButtonActive: {
    backgroundColor: '#1E3F20'
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3F20',
    marginLeft: 8
  },
  roleButtonTextActive: {
    color: '#fff'
  },
  inputGroup: { 
    width: '100%', 
    marginBottom: 20, 
    position: 'relative', 
    justifyContent: 'center' 
  },
  icon: { 
    position: 'absolute', 
    left: 15, 
    zIndex: 1 
  },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    paddingLeft: 45, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    fontSize: 16, 
    color: '#333' 
  },
  togglePassword: { 
    position: 'absolute', 
    right: 15, 
    zIndex: 1 
  },
  button: { 
    backgroundColor: '#1E3F20', 
    width: '100%', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonDisabled: {
    backgroundColor: '#cccccc'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  links: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  link: { 
    color: '#1E3F20', 
    fontSize: 14, 
    textDecorationLine: 'underline' 
  },
});

export default LoginScreen;
