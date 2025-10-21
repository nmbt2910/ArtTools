# Art Tools - Favorite List App

A React Native Expo app that allows users to browse, search, and manage their favorite art tools using AsyncStorage for local data persistence.

## Features

### 🏠 Home Screen
- **Browse Art Tools**: View all art tools in a beautiful grid layout
- **Search Functionality**: Search by art tool name or brand
- **Brand Filtering**: Filter art tools by brand with easy-to-use chips
- **Pull-to-Refresh**: Refresh data by pulling down on the list
- **Add to Favorites**: Tap the heart icon to add/remove from favorites
- **Navigation**: Tap any art tool to view detailed information

### 📱 Detail Screen
- **Complete Information**: View detailed art tool information including description and features
- **Customer Reviews**: See grouped customer feedback with star ratings
- **Add/Remove Favorites**: Toggle favorite status directly from the detail screen
- **Beautiful UI**: Modern, clean design with smooth animations

### ❤️ Favorites Screen
- **View Favorites**: See all your saved art tools in one place
- **Search Favorites**: Search within your saved favorites
- **Bulk Operations**: Select multiple items to remove at once
- **Individual Removal**: Remove single items with a tap
- **Clear All**: Remove all favorites with one action
- **Selection Mode**: Long-press to enter selection mode for bulk operations

## Technical Features

- **AsyncStorage Integration**: All favorites are stored locally on the device
- **React Navigation**: Smooth navigation with bottom tabs and stack navigation
- **API Integration**: Fetches data from MockAPI.io
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Proper loading indicators for better UX
- **Responsive Design**: Optimized for different screen sizes

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
│   ├── HomeScreen.js      # Main screen with art tools list
│   ├── DetailScreen.js    # Detailed view of individual art tools
│   └── FavoritesScreen.js # User's favorite art tools
├── services/
│   ├── apiService.js      # API calls to MockAPI.io
│   └── favoritesService.js # AsyncStorage operations
└── components/            # Reusable UI components
```

## API Integration

The app fetches data from MockAPI.io:
- **Base URL**: `https://68da41f623ebc87faa2f7a7a.mockapi.io/Art/art`
- **Data Structure**: Each art tool includes name, price, image, brand, description, and customer feedback

## Dependencies

- **@react-navigation/native**: Navigation framework
- **@react-navigation/bottom-tabs**: Bottom tab navigation
- **@react-navigation/native-stack**: Stack navigation
- **@react-native-async-storage/async-storage**: Local data persistence
- **react-native-elements**: UI component library
- **expo**: React Native development platform

## Key Features Implemented

✅ **Task 1**: Home, Detail, and Favorites screens with proper navigation
✅ **Task 2**: Complete art tool information display with customer feedback
✅ **Task 3**: Full CRUD operations for favorites with AsyncStorage
✅ **Task 4**: Search functionality across all screens
✅ **Task 5**: Pull-to-refresh and smooth navigation
✅ **Task 6**: Modern, attractive UI/UX design
✅ **Task 7**: Error handling and loading states
✅ **Task 8**: Brand filtering and bulk operations

## Usage

1. **Browse Art Tools**: Open the app to see all available art tools
2. **Search**: Use the search bar to find specific art tools
3. **Filter by Brand**: Tap brand chips to filter results
4. **View Details**: Tap any art tool to see detailed information
5. **Add to Favorites**: Tap the heart icon to save art tools
6. **Manage Favorites**: Go to the Favorites tab to view and manage saved items
7. **Remove Items**: Use individual remove buttons or bulk selection mode

## Screenshots

The app features a modern, clean design with:
- Purple/indigo color scheme for a professional look
- Card-based layouts for easy scanning
- Intuitive icons and clear typography
- Smooth animations and transitions
- Responsive design that works on all screen sizes

## Future Enhancements

- Offline data caching
- User authentication
- Social sharing features
- Advanced filtering options
- Wishlist functionality
- Push notifications for deals

