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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import useAuth from '../hooks/useAuth';

const RegisterScreen = ({ navigation }) => {
  const { register, loading } = useAuth();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => { 
    Animated.spring(animatedValue, { toValue: 0.95, useNativeDriver: true }).start(); 
  };
  
  const onPressOut = () => { 
    Animated.spring(animatedValue, { toValue: 1, friction: 3, useNativeDriver: true }).start(); 
  };

  const handleRegister = async () => {
    if (!nombre || !correo || !password) {
      Alert.alert("❌ Error", "Por favor completa todos los campos");
      return;
    }

    // Siempre se registra como 'user'
    const success = await register(nombre, correo, password, "user");
    if (success) {
      navigation.navigate("Login");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={loginStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" backgroundColor="#1E3F20" />
      
      <Image 
        source={require("../../assets/maya.jpg")} 
        style={loginStyles.backgroundImage} 
      />
      
      <View style={loginStyles.loginContainer}>
        
        <View style={registerStyles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={registerStyles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1E3F20" />
          </TouchableOpacity>
          <Text style={loginStyles.title}>Crear Cuenta</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={loginStyles.subtitle}>Regístrate como usuario</Text>
        
        {/* Información sobre el tipo de cuenta */}
        <View style={loginStyles.roleInfo}>
          <Ionicons name="information-circle-outline" size={20} color="#1E3F20" />
          <Text style={loginStyles.roleInfoText}>
            Te registrarás como usuario. Solo los administradores pueden gestionar la flota.
          </Text>
        </View>

        {/* Campo de Nombre */}
        <View style={loginStyles.inputGroup}>
          <Ionicons name="person" size={20} color="#1E3F20" style={loginStyles.icon} />
          <TextInput 
            style={loginStyles.input} 
            placeholder="Nombre completo" 
            placeholderTextColor="#777" 
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>
        
        {/* Campo de Correo */}
        <View style={loginStyles.inputGroup}>
          <Ionicons name="mail" size={20} color="#1E3F20" style={loginStyles.icon} />
          <TextInput 
            style={loginStyles.input} 
            placeholder="Correo electrónico" 
            placeholderTextColor="#777" 
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>
        
        {/* Campo de Contraseña */}
        <View style={loginStyles.inputGroup}>
          <Ionicons name="lock-closed" size={20} color="#1E3F20" style={loginStyles.icon} />
          <TextInput 
            style={loginStyles.input} 
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
            style={loginStyles.togglePassword}
            disabled={loading}
          >
            <Ionicons 
              name={showPassword ? "eye" : "eye-off"} 
              size={20} 
              color="#1E3F20" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Botón de Registro con animación */}
        <Animated.View style={{ width: '100%', transform: [{ scale: animatedValue }] }}>
          <TouchableOpacity 
            style={[
              loginStyles.button, 
              (!nombre || !correo || !password || loading) && loginStyles.buttonDisabled
            ]} 
            onPress={handleRegister} 
            onPressIn={onPressIn} 
            onPressOut={onPressOut}
            disabled={!nombre || !correo || !password || loading}
          >
            {loading ? (
              <Text style={loginStyles.buttonText}>Creando cuenta...</Text>
            ) : (
              <Text style={loginStyles.buttonText}>Registrarse como Usuario</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
        
        {/* Enlace de login */}
        <View style={loginStyles.links}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={loginStyles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Reutilizamos los mismos estilos del login
const loginStyles = StyleSheet.create({
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
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(89, 119, 91, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  roleInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#59775B',
    lineHeight: 16,
  },
  inputGroup: { 
    width: '100%', 
    marginBottom: 15, 
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
    marginTop: 10, 
    elevation: 3 
  },
  buttonDisabled: {
    backgroundColor: '#cccccc'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  links: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  link: { 
    color: '#1E3F20', 
    fontSize: 14, 
    marginBottom: 5, 
    textDecorationLine: 'underline' 
  },
});

// Estilos adicionales para el registro
const registerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
});

export default RegisterScreen;