# Art Tools - AI-Powered Art Tools App

A comprehensive React Native Expo app that allows users to browse, search, sort, and manage their favorite art tools with AI-powered recommendations. Features AsyncStorage for local data persistence and Gemini AI integration for intelligent product suggestions.

## Features

### 🏠 Home Screen
- **Browse Art Tools**: View all art tools in a beautiful grid layout
- **Advanced Search**: Real-time search by art tool name or brand
- **Brand Filtering**: Filter art tools by brand with horizontal scrollable chips
- **Smart Sorting**: Sort by Name, Price, or Discount with ascending/descending options
- **Pricing Display**: Current price + original price (strikethrough) + discount badges
- **Discount Indicators**: Visual discount badges showing percentage off
- **Pull-to-Refresh**: Refresh data by pulling down on the list
- **Add to Favorites**: Tap the heart icon to add/remove from favorites
- **Navigation**: Tap any art tool to view detailed information
- **Responsive Design**: Optimized card layout with proper alignment

### 📱 Detail Screen
- **Complete Information**: View detailed art tool information including description and features
- **Enhanced Pricing**: Current price + original price (strikethrough) + discount badges
- **Customer Reviews**: See grouped customer feedback with star ratings and distribution
- **Rating Breakdown**: Visual rating distribution with percentage breakdowns
- **Expandable Reviews**: Show/hide additional reviews by rating category
- **Add/Remove Favorites**: Toggle favorite status directly from the detail screen
- **Beautiful UI**: Modern, clean design with smooth animations
- **Responsive Layout**: Optimized for different screen sizes

### ❤️ Favorites Screen
- **View Favorites**: See all your saved art tools in one place
- **Enhanced Pricing**: Current price + original price (strikethrough) + discount badges
- **Search Favorites**: Search within your saved favorites
- **Bulk Operations**: Select multiple items to remove at once
- **Individual Removal**: Remove single items with a tap
- **Clear All**: Remove all favorites with one action
- **Selection Mode**: Long-press to enter selection mode for bulk operations
- **Responsive Design**: Adapts to different screen sizes with compact layouts
- **Action Bar**: Fixed bottom action bar for easy access to operations

### 🤖 AI Chat Screen
- **AI Assistant**: Intelligent chat with Gemini AI for art tool recommendations
- **Product Recommendations**: AI suggests relevant products based on user queries
- **Interactive Product Cards**: Tap recommended products to view details
- **Enhanced Pricing**: Current price + original price (strikethrough) + discount badges
- **Real-time Chat**: Instant responses with loading indicators
- **Keyboard Handling**: Proper keyboard avoidance and auto-scroll
- **Error Handling**: User-friendly error messages and retry functionality
- **Product Context**: AI has access to complete product catalog for accurate recommendations
- **Conversation History**: Maintains chat history during session
- **Responsive Design**: Optimized for different screen sizes

## Technical Features

- **AsyncStorage Integration**: All favorites are stored locally on the device
- **React Navigation**: Smooth navigation with bottom tabs and stack navigation
- **API Integration**: Fetches data from MockAPI.io
- **AI Integration**: Gemini AI for intelligent product recommendations
- **Performance Optimization**: Caching, memoization, and efficient rendering
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Proper loading indicators for better UX
- **Responsive Design**: Optimized for different screen sizes
- **Keyboard Management**: Proper keyboard handling across all screens
- **Memory Management**: Efficient state management and cleanup
- **Data Caching**: AI service caches product data for improved performance

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For Web: `npm run web`

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.js      # Main screen with art tools list, search, sorting
│   ├── DetailScreen.js    # Detailed view of individual art tools
│   ├── FavoritesScreen.js # User's favorite art tools with bulk operations
│   └── ChatScreen.js      # AI-powered chat for product recommendations
├── services/
│   ├── apiService.js      # API calls to MockAPI.io
│   ├── favoritesService.js # AsyncStorage operations
│   └── aiChatService.js   # Gemini AI integration and product recommendations
└── components/            # Reusable UI components
```

## API Integration

The app integrates with multiple APIs:

### MockAPI.io
- **Base URL**: `https://68da41f623ebc87faa2f7a7a.mockapi.io/Art/art`
- **Data Structure**: Each art tool includes name, price, image, brand, description, and customer feedback

### Gemini AI API
- **Service**: Google Gemini AI for intelligent product recommendations
- **Features**: Context-aware responses, product suggestions, natural language processing
- **Caching**: 5-minute cache for improved performance

## Dependencies

- **@react-navigation/native**: Navigation framework
- **@react-navigation/bottom-tabs**: Bottom tab navigation
- **@react-navigation/native-stack**: Stack navigation
- **@react-native-async-storage/async-storage**: Local data persistence
- **@expo/vector-icons**: Icon library (Ionicons)
- **react-native-safe-area-context**: Safe area handling
- **expo**: React Native development platform

## Key Features Implemented

✅ **Core Navigation**: Home, Detail, Favorites, and AI Chat screens with proper navigation
✅ **Complete Product Display**: Art tool information with enhanced pricing and discount badges
✅ **Full CRUD Operations**: Favorites management with AsyncStorage persistence
✅ **Advanced Search**: Real-time search functionality across all screens
✅ **Smart Sorting**: Name, Price, Discount sorting with ascending/descending options
✅ **Brand Filtering**: Horizontal scrollable brand filter chips
✅ **AI Integration**: Gemini AI for intelligent product recommendations
✅ **Enhanced Pricing**: Original price with strikethrough for discounted items
✅ **Bulk Operations**: Multi-select and bulk operations for favorites
✅ **Pull-to-Refresh**: Smooth data refresh functionality
✅ **Modern UI/UX**: Professional design with purple theme and responsive layout
✅ **Error Handling**: Comprehensive error handling and loading states
✅ **Performance Optimization**: Caching, memoization, and efficient rendering
✅ **Keyboard Management**: Proper keyboard handling across all screens
✅ **Responsive Design**: Optimized for different screen sizes

## Usage

1. **Browse Art Tools**: Open the app to see all available art tools with enhanced pricing
2. **Search & Filter**: Use search bar and brand filters to find specific art tools
3. **Sort Products**: Sort by Name, Price, or Discount with ascending/descending options
4. **View Details**: Tap any art tool to see detailed information with customer reviews
5. **Add to Favorites**: Tap the heart icon to save art tools
6. **AI Recommendations**: Use the AI Chat tab to get intelligent product suggestions
7. **Manage Favorites**: Go to the Favorites tab to view and manage saved items
8. **Bulk Operations**: Use selection mode for bulk removal of favorites
9. **Compare Prices**: See original prices with strikethrough for discounted items
10. **Review Products**: Read customer feedback and ratings in detail view

## Screenshots

The app features a modern, clean design with:
- Purple/indigo color scheme (#6366f1) for a professional look
- Card-based layouts with enhanced pricing display
- Discount badges and strikethrough original prices
- AI chat interface with product recommendations
- Intuitive icons and clear typography
- Smooth animations and transitions
- Responsive design that works on all screen sizes
- Smart sorting and filtering options
- Bulk operations for favorites management

## Future Enhancements

- **Advanced AI Features**: Voice input, image recognition for product search
- **User Authentication**: Account creation and login system
- **Social Features**: Share favorites, user reviews, and recommendations
- **Advanced Filtering**: Price range, rating filters, surface type filters
- **Wishlist Functionality**: Separate wishlist from favorites
- **Push Notifications**: Deal alerts and price drop notifications
- **Offline Mode**: Full offline functionality with data synchronization
- **Product Comparison**: Side-by-side product comparison feature
- **AR Integration**: Augmented reality for product visualization
- **Analytics**: User behavior tracking and personalized recommendations

