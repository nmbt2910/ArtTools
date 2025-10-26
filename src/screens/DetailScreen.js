import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';

// Helper function to safely convert string/boolean values to boolean
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

const { width } = Dimensions.get('window');

const DetailScreen = ({ route, navigation }) => {
  const { artTool } = route.params;
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedRatings, setExpandedRatings] = useState({});

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await isFavorite(artTool.id);
      setIsFav(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      
      if (isFav) {
        const success = await removeFromFavorites(artTool.id);
        if (success) {
          setIsFav(false);
          Alert.alert('Success', 'Removed from favorites');
        } else {
          Alert.alert('Error', 'Failed to remove from favorites');
        }
      } else {
        const success = await addToFavorites(artTool);
        if (success) {
          setIsFav(true);
          Alert.alert('Success', 'Added to favorites');
        } else {
          Alert.alert('Error', 'Failed to add to favorites');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#fbbf24' : '#d1d5db'}
        />
      );
    }
    return stars;
  };

  const groupFeedbacksByRating = (feedbacks) => {
    const grouped = {};
    feedbacks.forEach(feedback => {
      if (!grouped[feedback.rating]) {
        grouped[feedback.rating] = [];
      }
      grouped[feedback.rating].push(feedback);
    });
    return grouped;
  };

  const getRatingDistribution = (feedbacks) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const total = feedbacks.length;
    
    feedbacks.forEach(feedback => {
      if (distribution.hasOwnProperty(feedback.rating)) {
        distribution[feedback.rating]++;
      }
    });

    return Object.keys(distribution).map(rating => ({
      rating: parseInt(rating),
      count: distribution[rating],
      percentage: total > 0 ? Math.round((distribution[rating] / total) * 100) : 0
    }));
  };

  const toggleRatingExpansion = (rating) => {
    setExpandedRatings(prev => ({
      ...prev,
      [rating]: !prev[rating]
    }));
  };

  const groupedFeedbacks = groupFeedbacksByRating(artTool.feedbacks || []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: artTool.image }} style={styles.image} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          disabled={loading}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={28}
            color={isFav ? '#ef4444' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.title}>{artTool.artName}</Text>
          <Text style={styles.brand}>{artTool.brand}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${Number(artTool.price) || 0}</Text>
            {Number(artTool.limitedTimeDeal) > 0 && (
              <Text style={styles.originalPrice}>
                ${(Number(artTool.price) / (1 - Number(artTool.limitedTimeDeal))).toFixed(2)}
              </Text>
            )}
          </View>
          {Number(artTool.limitedTimeDeal) > 0 && (
            <View style={styles.dealContainer}>
              <Text style={styles.dealText}>
                {Math.round(Number(artTool.limitedTimeDeal) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{artTool.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.featureText}>
              {toBoolean(artTool.glassSurface) ? 'Suitable for glass surfaces' : 'Regular surface application'}
            </Text>
          </View>
        </View>

        {/* Feedback Section */}
        {artTool.feedbacks && Array.isArray(artTool.feedbacks) && artTool.feedbacks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            
            {/* Rating Summary */}
            <View style={styles.ratingSummary}>
              <View style={styles.ratingOverview}>
                <Text style={styles.ratingNumber}>
                  {(artTool.feedbacks.reduce((sum, f) => sum + f.rating, 0) / artTool.feedbacks.length).toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(Math.round(artTool.feedbacks.reduce((sum, f) => sum + f.rating, 0) / artTool.feedbacks.length))}
                </View>
                <Text style={styles.ratingCount}>
                  Based on {artTool.feedbacks.length} reviews
                </Text>
              </View>
              
              {/* Rating Distribution */}
              <View style={styles.ratingDistribution}>
                <Text style={styles.distributionTitle}>Rating Breakdown</Text>
                {getRatingDistribution(artTool.feedbacks).map(({ rating, count, percentage }) => (
                  <View key={rating} style={styles.distributionRow}>
                    <View style={styles.distributionStars}>
                      <Text style={styles.distributionRating}>{rating}</Text>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                    </View>
                    <View style={styles.distributionBar}>
                      <View 
                        style={[
                          styles.distributionBarFill, 
                          { width: `${percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.distributionCount}>
                      {count} ({percentage}%)
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Grouped Reviews by Rating */}
            {Object.keys(groupedFeedbacks)
              .sort((a, b) => parseInt(b) - parseInt(a))
              .map(rating => (
                <View key={rating} style={styles.ratingGroup}>
                  <View style={styles.ratingGroupHeader}>
                    <Text style={styles.ratingGroupTitle}>
                      {rating} Star{rating !== '1' ? 's' : ''}
                    </Text>
                    <Text style={styles.ratingGroupCount}>
                      {groupedFeedbacks[rating].length} review{groupedFeedbacks[rating].length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  {groupedFeedbacks[rating].slice(0, expandedRatings[rating] ? groupedFeedbacks[rating].length : 3).map((feedback, index) => (
                    <View key={index} style={styles.feedbackItem}>
                      <View style={styles.feedbackHeader}>
                        <Text style={styles.feedbackAuthor}>{feedback.author}</Text>
                        <Text style={styles.feedbackDate}>
                          {new Date(feedback.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.feedbackComment}>{feedback.comment}</Text>
                    </View>
                  ))}
                  
                  {groupedFeedbacks[rating].length > 3 && (
                    <TouchableOpacity 
                      style={styles.moreReviewsButton}
                      onPress={() => toggleRatingExpansion(rating)}
                    >
                      <Text style={styles.moreReviews}>
                        {expandedRatings[rating] 
                          ? 'Show Less' 
                          : `+${groupedFeedbacks[rating].length - 3} more reviews`
                        }
                      </Text>
                      <Ionicons 
                        name={expandedRatings[rating] ? 'chevron-up' : 'chevron-down'} 
                        size={16} 
                        color="#6366f1" 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteActionButton]}
            onPress={toggleFavorite}
            disabled={loading}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={20}
              color={isFav ? '#ef4444' : '#6366f1'}
            />
            <Text style={[styles.actionButtonText, isFav && styles.favoriteActionButtonText]}>
              {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 32,
  },
  brand: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#059669',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 20,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  dealContainer: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dealText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 12,
  },
  ratingSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  ratingOverview: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingGroup: {
    marginBottom: 20,
  },
  ratingGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ratingGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  ratingGroupCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  feedbackItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  feedbackComment: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  ratingDistribution: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionStars: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  distributionRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: '#6b7280',
    width: 60,
    textAlign: 'right',
  },
  moreReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moreReviews: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginRight: 4,
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  favoriteActionButton: {
    backgroundColor: '#f8fafc',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 8,
  },
  favoriteActionButtonText: {
    color: '#ef4444',
  },
});

export default DetailScreen;

