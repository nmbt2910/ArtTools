import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorite_art_tools';

export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addToFavorites = async (artTool) => {
  try {
    const favorites = await getFavorites();
    const isAlreadyFavorite = favorites.some(item => item.id === artTool.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, artTool];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async (artToolId) => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(item => item.id !== artToolId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const removeMultipleFromFavorites = async (artToolIds) => {
  try {
    const favorites = await getFavorites();
    console.log('Before batch remove:', favorites.length, 'items');
    const updatedFavorites = favorites.filter(item => !artToolIds.includes(item.id));
    console.log('After batch remove:', updatedFavorites.length, 'items');
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing multiple from favorites:', error);
    return false;
  }
};

export const clearAllFavorites = async () => {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};

export const isFavorite = async (artToolId) => {
  try {
    const favorites = await getFavorites();
    return favorites.some(item => item.id === artToolId);
  } catch (error) {
    console.error('Error checking if favorite:', error);
    return false;
  }
};

