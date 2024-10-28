import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AppIntroSlider from 'react-native-app-intro-slider';

// Lấy kích thước màn hình
const { width, height } = Dimensions.get('window');

// Dữ liệu cho các slide onboarding
const imageUrl1 = 'https://cdn.glitch.global/bbd93b5a-5c73-4329-8170-0bf5a6090f3b/083fa751-6228-4967-94d3-2f746ce2058a.image.png?v=1730106873416';
const imageUrl2 = 'https://cdn.glitch.global/bbd93b5a-5c73-4329-8170-0bf5a6090f3b/dff79edd-b8dc-42c5-ab18-a2c68b6430ad.image.png?v=1730106886991';
const imageUrl3 = 'https://cdn.glitch.global/bbd93b5a-5c73-4329-8170-0bf5a6090f3b/15bc8b2f-4784-414b-a274-b61dfaf03c9c.image.png?v=1730106897859';

const slides = [
  {
    key: '1',
    title: 'Welcome to the App',
    text: 'Discover all the amazing features!',
    image: imageUrl1,
    backgroundColor: '#59b2ab',
  },
  {
    key: '2',
    title: 'Scan with Ease',
    text: 'Quickly scan and manage everything.',
    image: imageUrl2,
    backgroundColor: '#febe29',
  },
  {
    key: '3',
    title: 'Let’s Get Started!',
    text: 'Experience the future today.',
    image: imageUrl3,
    backgroundColor: '#22bcb5',
  },
];


// Màn hình Onboarding
function OnboardingScreen({ navigation }) {
  const [showMainApp, setShowMainApp] = useState(false);

  const _renderItem = ({ item }) => {
    return (
      <View style={{ flex: 1, backgroundColor: item.backgroundColor }}>
        <Image
          source={item.image}
          style={{ width: width, height: height * 0.7, resizeMode: 'cover' }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' }}>
          {item.title}
        </Text>
        <Text style={{ textAlign: 'center', marginHorizontal: 20 }}>{item.text}</Text>
      </View>
    );
  };

  const _onDone = () => {
    setShowMainApp(true);
  };

  if (showMainApp) {
    navigation.replace('MainApp');
    return null;
  } else {
    return <AppIntroSlider renderItem={_renderItem} data={slides} onDone={_onDone} />;
  }
}

// Dữ liệu sản phẩm ban đầu
const initialProducts = [
  {
    id: '1',
    name: 'Sản phẩm 1',
    price: 10000,
    image: 'https://cdn.glitch.global/bbd93b5a-5c73-4329-8170-0bf5a6090f3b/083fa751-6228-4967-94d3-2f746ce2058a.image.png?v=1730106873416',
  },
  {
    id: '2',
    name: 'Sản phẩm 2',
    price: 20000,
    image: 'https://cdn.glitch.global/bbd93b5a-5c73-4329-8170-0bf5a6090f3b/dff79edd-b8dc-42c5-ab18-a2c68b6430ad.image.png?v=1730106886991',
  },
  {
    id: '3',
    name: 'Sản phẩm 3',
    price: 30000,
    image: 'https://cdn.glitch.global/bbd93b5a-5c73-4329-8170-0bf5a6090f3b/15bc8b2f-4784-414b-a274-b61dfaf03c9c.image.png?v=1730106897859',
  },
];

// Màn hình chính
function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Màn hình chính</Text>
      <Text style={styles.description}>welcome to my app!!!!!!</Text>
    </View>
  );
}

// Màn hình giỏ hàng
function CartScreen({ cart, changeQuantity, removeFromCart, totalPrice }) {
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.cartItemDetails}>
        <Text>{item.name}</Text>
        <Text>{item.price} VND</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => changeQuantity(item.id, -1)}>
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text>{item.quantity}</Text>
          <TouchableOpacity onPress={() => changeQuantity(item.id, 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => removeFromCart(item.id)}>
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <Text style={styles.totalPrice}>Tổng giá: {totalPrice} VND</Text>
    </View>
  );
}

// Màn hình quét mã
function ScanScreen({ addToCart }) {
  const [productId, setProductId] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const scannedProduct = initialProducts.find(product => product.id === data);
    if (scannedProduct) {
      addToCart(scannedProduct);
      Alert.alert('Thông báo', `Đã thêm ${scannedProduct.name} vào giỏ hàng.`);
      setProductId(''); // Reset input field
    } else {
      Alert.alert('Thông báo', 'Không tìm thấy sản phẩm với ID này.');
    }
  };

  const handleAddToCart = () => {
    const scannedProduct = initialProducts.find(product => product.id === productId);
    if (scannedProduct) {
      addToCart(scannedProduct);
      Alert.alert('Thông báo', `Đã thêm ${scannedProduct.name} vào giỏ hàng.`);
      setProductId(''); // Reset input field
    } else {
      Alert.alert('Thông báo', 'Không tìm thấy sản phẩm với ID này.');
    }
  };

  if (hasCameraPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quét mã sản phẩm</Text>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={productId}
          onChangeText={setProductId}
          placeholder="Nhập ID sản phẩm"
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={handleAddToCart} style={styles.addButton}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Cấu trúc BottomTab và Stack Navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// MainApp component
const MainApp = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const saveCart = useCallback(async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.log('Lỗi khi lưu giỏ hàng:', error);
    }
  }, [cart]);

  const calculateTotalPrice = useCallback(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [cart]);

  useEffect(() => {
    calculateTotalPrice();
    saveCart();
  }, [calculateTotalPrice, saveCart]);

  const addToCart = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const changeQuantity = (id, amount) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        if (newQuantity <= 0) {
          return null; // Remove the item
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item)); // Filter out nulls
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: () => <Icon name="home" size={24} color="black" />,
        }} 
      />
      <Tab.Screen 
        name="Scan" 
        options={{
          tabBarLabel: 'Quét mã',
          tabBarIcon: () => <Icon name="qr-code-scanner" size={24} color="black" />,
        }}
      >
        {() => <ScanScreen addToCart={addToCart} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Cart" 
        options={{
          tabBarLabel: 'Giỏ hàng',
          tabBarIcon: () => <Icon name="shopping-cart" size={24} color="black" />,
        }}
      >
        {() => <CartScreen cart={cart} changeQuantity={changeQuantity} removeFromCart={removeFromCart} totalPrice={totalPrice} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Cấu hình Navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainApp} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
  },
  button: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  cartItemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cartItemDetails: {
    marginLeft: 10,
    flex: 1,
  },
  productImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  totalPrice: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
});

