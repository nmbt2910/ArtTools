import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, removeFromFavorites, clearAllFavorites, removeMultipleFromFavorites } from '../services/favoritesService';

// Helper function to safely convert string/boolean values to boolean
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const iconSizeSmall = isCompact ? 16 : 18;
  const iconSizeMedium = isCompact ? 18 : 20;

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data);
      setFilteredFavorites(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Filter favorites by search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = favorites.filter(item =>
        item.artName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [favorites, searchQuery]);

  const toggleSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === filteredFavorites.length) {
      // If all are selected, deselect all
      setSelectedItems(new Set());
    } else {
      // Select all visible items
      setSelectedItems(new Set(filteredFavorites.map(item => item.id)));
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems(new Set());
  };

  const removeSelectedItems = async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Remove Items',
      `Are you sure you want to remove ${selectedItems.size} item(s) from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use batch remove to avoid race conditions
              const selectedIds = Array.from(selectedItems);
              console.log('Removing items with IDs:', selectedIds);
              const success = await removeMultipleFromFavorites(selectedIds);
              
              if (success) {
                // Update state by filtering out selected items
                setFavorites(prev => prev.filter(item => !selectedItems.has(item.id)));
                setFilteredFavorites(prev => prev.filter(item => !selectedItems.has(item.id)));
                setSelectedItems(new Set());
                setSelectionMode(false);
                
                Alert.alert('Success', 'Items removed from favorites');
              } else {
                Alert.alert('Error', 'Failed to remove items. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove items. Please try again.');
              console.error('Error removing items:', error);
            }
          },
        },
      ]
    );
  };

  const clearAllFavoritesHandler = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all items from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAllFavorites();
              if (success) {
                // Clear all state immediately
                setFavorites([]);
                setFilteredFavorites([]);
                setSelectedItems(new Set());
                setSelectionMode(false);
                Alert.alert('Success', 'All favorites cleared');
              } else {
                Alert.alert('Error', 'Failed to clear favorites. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
              console.error('Error clearing favorites:', error);
            }
          },
        },
      ]
    );
  };

  const removeSingleItem = async (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeFromFavorites(itemId);
              if (success) {
                setFavorites(prev => prev.filter(item => item.id !== itemId));
                setFilteredFavorites(prev => prev.filter(item => item.id !== itemId));
                Alert.alert('Success', 'Item removed from favorites');
              } else {
                Alert.alert('Error', 'Failed to remove item. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
              console.error('Error removing item:', error);
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (item) => {
    try {
      const success = await removeFromFavorites(item.id);
      if (success) {
        setFavorites(prev => prev.filter(favItem => favItem.id !== item.id));
        setFilteredFavorites(prev => prev.filter(favItem => favItem.id !== item.id));
      } else {
        Alert.alert('Error', 'Failed to remove item from favorites. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
      console.error('Error removing from favorites:', error);
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <Pressable
      style={[
        styles.favoriteCard,
        selectedItems.has(item.id) && styles.selectedCard,
      ]}
      onPress={() => {
        if (selectionMode) {
          toggleSelection(item.id);
        } else {
          navigation.navigate('Detail', { artTool: item });
        }
      }}
      onLongPress={() => {
        if (!selectionMode) {
          setSelectionMode(true);
          toggleSelection(item.id);
        }
      }}
    >
      {selectionMode && (
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectedItems.has(item.id) ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={selectedItems.has(item.id) ? '#6366f1' : '#9ca3af'}
          />
        </View>
      )}
      
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.favoriteName} numberOfLines={2}>
            {item.artName}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name="heart"
              size={20}
              color="#ef4444"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.favoriteBrand}>{item.brand}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${Number(item.price) || 0}</Text>
          {Number(item.limitedTimeDeal) > 0 && (
            <Text style={styles.originalPrice}>
              ${(Number(item.price) / (1 - Number(item.limitedTimeDeal))).toFixed(2)}
            </Text>
          )}
        </View>
        {Number(item.limitedTimeDeal) > 0 && (
          <Text style={styles.deal}>
            {Math.round(Number(item.limitedTimeDeal) * 100)}% OFF
          </Text>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.glassSurface}>
            {toBoolean(item.glassSurface) ? 'Glass Surface' : 'Regular Surface'}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6b7280"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Favorites List */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No favorites found' : 'No favorites yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Add some art tools to your favorites to see them here'
              }
            </Text>
          </View>
        }
      />

      {/* Action Bar - Fixed at bottom */}
      {favorites.length > 0 && (
        <View style={styles.actionBar}>
          {!selectionMode ? (
            <View style={styles.normalActionContainer}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={toggleSelectionMode}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={iconSizeMedium}
                  color="#6366f1"
                />
                <Text style={[styles.primaryActionButtonText, { fontSize: isCompact ? 12 : 14 }]} numberOfLines={1} ellipsizeMode="tail">
                  Select Items
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dangerActionButton}
                onPress={clearAllFavoritesHandler}
              >
                <Ionicons
                  name="trash"
                  size={iconSizeMedium}
                  color="#ffffff"
                />
                <Text style={[styles.dangerActionButtonText, { fontSize: isCompact ? 12 : 14 }]} numberOfLines={1} ellipsizeMode="tail">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectionActionContainer}>
              <TouchableOpacity
                style={styles.iconActionButton}
                onPress={toggleSelectionMode}
                accessibilityLabel="Cancel selection"
              >
                <Ionicons name="close" size={iconSizeSmall} color="#6b7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionButton, styles.primaryGrow]}
                onPress={selectAll}
              >
                <Ionicons 
                  name={selectedItems.size === filteredFavorites.length ? 'checkmark-done' : 'checkmark-done-outline'} 
                  size={iconSizeSmall} 
                  color="#6366f1" 
                />
                <Text style={[styles.primaryActionButtonText, { fontSize: isCompact ? 12 : 14 }]} numberOfLines={1} ellipsizeMode="tail">
                  {selectedItems.size === filteredFavorites.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconDangerButton, selectedItems.size === 0 && styles.disabledButton]}
                onPress={removeSelectedItems}
                disabled={selectedItems.size === 0}
                accessibilityLabel={`Delete ${selectedItems.size} selected`}
              >
                <Ionicons name="trash" size={iconSizeSmall} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20, // Extra padding for safe area
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  normalActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: '#ffffff',
    flex: 1,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minWidth: 0,
    flexShrink: 1,
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4,
  },
  dangerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    minWidth: 0,
    flexShrink: 1,
  },
  dangerActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  compactAction: {
    flexBasis: '32%',
  },
  primaryGrow: {
    flex: 1,
  },
  iconActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  iconDangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    borderColor: '#d1d5db',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding to account for fixed action bar
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  selectedCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  favoriteImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  favoriteInfo: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 8, // Add margin to prevent text overlay
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    flex: 1, // Allow text to wrap properly
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  deal: {
    fontSize: 12,
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  glassSurface: {
    fontSize: 10,
    color: '#6b7280',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default FavoritesScreen;

