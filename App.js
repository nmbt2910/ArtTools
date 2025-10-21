import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import DetailScreen from './src/screens/DetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create context for tab bar visibility
const TabBarContext = React.createContext();

// Custom DetailScreen wrapper to manage tab bar visibility
const DetailScreenWrapper = ({ route, navigation }) => {
  const { setTabBarVisible } = React.useContext(TabBarContext);
  
  React.useEffect(() => {
    setTabBarVisible(false);
    return () => setTabBarVisible(true);
  }, [setTabBarVisible]);

  return <DetailScreen route={route} navigation={navigation} />;
};

// Stack Navigator for Home tab
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ 
          title: 'Art Tools',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreenWrapper} 
        options={{ 
          title: 'Art Tool Details',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Favorites tab
function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FavoritesMain" 
        component={FavoritesScreen} 
        options={{ 
          title: 'My Favorites',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreenWrapper} 
        options={{ 
          title: 'Art Tool Details',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [tabBarVisible, setTabBarVisible] = useState(true);

  return (
    <TabBarContext.Provider value={{ tabBarVisible, setTabBarVisible }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = Boolean(focused) ? 'home' : 'home-outline';
              } else if (route.name === 'Favorites') {
                iconName = Boolean(focused) ? 'heart' : 'heart-outline';
              }

              return <Ionicons name={iconName} size={Number(size)} color={color} />;
            },
            tabBarActiveTintColor: '#6366f1',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: tabBarVisible ? {
              backgroundColor: '#f8fafc',
              borderTopWidth: Number(1),
              borderTopColor: '#e2e8f0',
              paddingBottom: Number(5),
              paddingTop: Number(5),
              height: Number(60),
            } : { display: 'none' },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeStack} 
            options={{ 
              headerShown: Boolean(false),
              title: 'Home'
            }} 
          />
          <Tab.Screen 
            name="Favorites" 
            component={FavoritesStack} 
            options={{ 
              headerShown: Boolean(false),
              title: 'Favorites'
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </TabBarContext.Provider>
  );
}