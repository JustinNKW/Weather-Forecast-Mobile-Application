import { useCallback, useEffect,useState}  from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

// Screens
import HomeScreen from './screens/homeScreen';
import SearchScreen from './screens/searchScreen';
import BookmarksScreen from './screens/bookmarksScreen';
import DetailsScreen from './screens/detailsScreen';
import MapScreen from './screens/mapScreen';

//Screen Navigation
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BOOKMARK_KEY = '@weather_bookmarks';

//Bottom Navigation
function NavigationBar({bookmarks,toggleBookmark}) 
{
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
     
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = focused
              ? require('./assets/homeActive.png') 
              : require('./assets/homeNormal.png');
          }

          if (route.name === 'Search') {
            iconSource = focused
              ? require('./assets/searchActive.png')
              : require('./assets/searchNormal.png');
          }

            if (route.name === 'Map') {
            iconSource = focused
              ? require('./assets/mapiconred.png')
              : require('./assets/mapicon.png');
          }

          if (route.name === 'Bookmarks') {
            iconSource = focused
              ? require('./assets/bookmarkActive.png')
              : require('./assets/bookmark.png');
          }

          return (
            <Image source={iconSource}
              style = {styles.tabIcons}/>
          );
        },

        tabBarActiveTintColor: '#222',
        tabBarInactiveTintColor: '#999',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarStyle: {
          height: 100,
          paddingTop: 5,
          paddingBottom: 8,
        },
      })}>
      <Tab.Screen name="Home"component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen}/>
      <Tab.Screen name="Map" component={MapScreen}/>
      <Tab.Screen name="Bookmarks">
        {(props) => (
          <BookmarksScreen
            {...props}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}/>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

//Main app
export default function App() {
  
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoaded, setBookmarksLoaded,] = useState(false);

  //Load Bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const savedBookmarks = await AsyncStorage.getItem(BOOKMARK_KEY);

        if (savedBookmarks !== null) {
          setBookmarks(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.log('Error loading bookmarks:', error);
      } finally {
        setBookmarksLoaded(true);
      }
    };
    loadBookmarks();
  }, []);


  //Set all screens to portrait orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  //Save Bookmarks
  useEffect(() => {
    if (!bookmarksLoaded) {
      return;
    }

    const saveBookmarks = async () => {
      try {
        await AsyncStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.log('Error saving bookmarks:', error);
      }
    };

    saveBookmarks();
  }, [bookmarks, bookmarksLoaded]);

  // Add/Remove Boookmarks
  const toggleBookmark = useCallback((location) => {

      if (!location) {
        return;
      }

      setBookmarks(
        (currentBookmarks) => {

          const exists = currentBookmarks.some((item) => item.name === location.name);

          // Remove bookmark
          if (exists) {
            return currentBookmarks.filter((item) => item.name !== location.name);
          }

          // Add Bookmark
          return [...currentBookmarks, location];
        }
      );
    }, []);


//Bottom Navigation Bar
  return (
    <NavigationContainer>

      <Stack.Navigator>

        {/* Bottom Tabs */}
        <Stack.Screen
          name="Main"
          options={{
            headerShown: false,
          }}>

          {(props) => (
            <NavigationBar
              {...props}
              bookmarks={bookmarks}
              toggleBookmark={
                toggleBookmark
              }/>
          )}
        </Stack.Screen>

        {/* WEATHER DETAILS */}
        <Stack.Screen
          name="Details"
          options={{
            title: 'Weather Details',
          }}>

          {(props) => (
            <DetailsScreen
              {...props}
              bookmarks={bookmarks}
              toggleBookmark={
                toggleBookmark
              }/>
          )}
        </Stack.Screen>

      </Stack.Navigator>

    </NavigationContainer>
  );
}


const styles = StyleSheet.create({

  tabIcons:{
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },


});
