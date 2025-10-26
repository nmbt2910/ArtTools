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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchArtTools } from '../services/apiService';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';

// Helper function to safely convert string/boolean values to boolean
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

const HomeScreen = ({ navigation }) => {
  const [artTools, setArtTools] = useState([]);
  const [filteredArtTools, setFilteredArtTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [favorites, setFavorites] = useState(new Set());

  // Get unique brands for filtering
  const brands = ['All', ...new Set(artTools.map(tool => tool.brand))];

  // Sorting options
  const sortOptions = [
    { key: 'name', label: 'Name', icon: 'text' },
    { key: 'price', label: 'Price', icon: 'cash' },
    { key: 'discount', label: 'Discount', icon: 'pricetag' },
  ];

  const loadArtTools = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchArtTools();
      console.log('Loaded data:', data.length, 'items');
      console.log('First item:', data[0]);
      setArtTools(data);
      setFilteredArtTools(data);
      
      // Load favorites status
      const favoriteIds = new Set();
      for (const tool of data) {
        const isFav = await isFavorite(tool.id);
        if (isFav) {
          favoriteIds.add(tool.id);
        }
      }
      setFavorites(favoriteIds);
    } catch (error) {
      Alert.alert('Error', 'Failed to load art tools. Please try again.');
      console.error('Error loading art tools:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArtTools();
    setRefreshing(false);
  }, [loadArtTools]);

  useEffect(() => {
    loadArtTools();
  }, [loadArtTools]);

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadArtTools();
    }, [loadArtTools])
  );

  // Filter, search, and sort functionality
  useEffect(() => {
    let filtered = artTools;

    // Filter by brand
    if (selectedBrand !== 'All') {
      filtered = filtered.filter(tool => tool.brand === selectedBrand);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tool =>
        tool.artName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.artName.toLowerCase();
          bValue = b.artName.toLowerCase();
          break;
        case 'price':
          aValue = Number(a.price) || 0;
          bValue = Number(b.price) || 0;
          break;
        case 'discount':
          aValue = Number(a.limitedTimeDeal) || 0;
          bValue = Number(b.limitedTimeDeal) || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredArtTools(filtered);
  }, [artTools, selectedBrand, searchQuery, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const toggleFavorite = async (artTool) => {
    try {
      const isFav = favorites.has(artTool.id);
      
      if (isFav) {
        const success = await removeFromFavorites(artTool.id);
        if (success) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(artTool.id);
            return newSet;
          });
        }
      } else {
        const success = await addToFavorites(artTool);
        if (success) {
          setFavorites(prev => new Set(prev).add(artTool.id));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
      console.error('Error toggling favorite:', error);
    }
  };

  const renderArtTool = ({ item }) => {
    console.log('Rendering item:', item); // Debug log
    return (
      <Pressable
        style={styles.artToolCard}
        onPress={() => navigation.navigate('Detail', { artTool: item })}
      >
        <Image source={{ uri: item.image }} style={styles.artToolImage} />
        <View style={styles.artToolInfo}>
          <Text style={styles.artToolName} numberOfLines={2}>
            {item.artName}
          </Text>
          <Text style={styles.artToolBrand}>{item.brand}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${Number(item.price) || 0}</Text>
            {Number(item.limitedTimeDeal) > 0 && (
              <Text style={styles.originalPrice}>
                ${(Number(item.price) / (1 - Number(item.limitedTimeDeal))).toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.dealContainer}>
            {Number(item.limitedTimeDeal) > 0 && (
              <Text style={styles.deal}>
                {Math.round(Number(item.limitedTimeDeal) * 100)}% OFF
              </Text>
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.glassSurface}>
              {toBoolean(item.glassSurface) ? 'Glass Surface' : 'Regular Surface'}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavorite(item)}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
                size={24}
                color={favorites.has(item.id) ? '#ef4444' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderBrandFilter = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.brandFilter,
        selectedBrand === item && styles.selectedBrandFilter,
      ]}
      onPress={() => setSelectedBrand(item)}
    >
      <Text
        style={[
          styles.brandFilterText,
          selectedBrand === item && styles.selectedBrandFilterText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        sortBy === item.key && styles.selectedSortOption,
      ]}
      onPress={() => handleSortChange(item.key)}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={sortBy === item.key ? '#fff' : '#6b7280'} 
        style={styles.sortIcon}
      />
      <Text
        style={[
          styles.sortOptionText,
          sortBy === item.key && styles.selectedSortOptionText,
        ]}
      >
        {item.label}
      </Text>
      {sortBy === item.key && (
        <Ionicons 
          name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
          size={14} 
          color="#fff" 
          style={styles.sortOrderIcon}
        />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading art tools...</Text>
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
          placeholder="Search art tools..."
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

      {/* Brand Filters */}
      <View style={styles.brandFiltersContainer}>
        <FlatList
          data={brands}
          renderItem={renderBrandFilter}
          keyExtractor={(item, index) => `brand-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandFiltersList}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortTitle}>Sort by:</Text>
        <FlatList
          data={sortOptions}
          renderItem={renderSortOption}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortOptionsList}
          scrollEnabled={true}
          bounces={false}
        />
      </View>

      {/* Art Tools List */}
      <FlatList
        data={filteredArtTools}
        renderItem={renderArtTool}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No art tools found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
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
  brandFiltersContainer: {
    marginBottom: 16,
  },
  brandFiltersList: {
    paddingHorizontal: 16,
  },
  brandFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedBrandFilter: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  brandFilterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedBrandFilterText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  artToolCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  artToolImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  artToolInfo: {
    padding: 12,
  },
  artToolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  artToolBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  dealContainer: {
    height: 20,
    marginBottom: 4,
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
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  sortOptionsList: {
    paddingRight: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedSortOption: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  sortIcon: {
    marginRight: 6,
  },
  sortOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedSortOptionText: {
    color: '#fff',
  },
  sortOrderIcon: {
    marginLeft: 4,
  },
});

export default HomeScreen;

