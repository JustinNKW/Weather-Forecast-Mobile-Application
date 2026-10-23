import { useCallback, useEffect, useState } from 'react';
import {View, Image, Text, StyleSheet, FlatList, TouchableOpacity,} from 'react-native';
import { getCurrentWeather } from '../api/weatherApi';
import { getWeatherDescription } from '../util/weatherDesc';
import * as Network from 'expo-network';

export default function BookmarksScreen({navigation, bookmarks, toggleBookmark,}) {

  //Bookmark Page Dependencies 
  const [weatherData, setWeatherData] = useState({});
  const [error, setError] = useState(null);

  //There are five main regions in Singapore. All region is added.
  //Default selected region will be all.
  const [selectedRegion, setSelectedRegion] = useState('All');
  const regions = ['All', 'Central', 'North', 'South', 'East', 'West'];

  // Filter bookmarks by selected region
  const filteredBookmarks =
    selectedRegion === 'All'
      ? bookmarks
      : bookmarks.filter((location) => location.region === selectedRegion
    );

  //Retrieve Bookmark Temperatures
  const getBookmarkTemperatures = useCallback(async () => {
    try {
      setError(null);

      // Check internet connection
      const networkState = await Network.getNetworkStateAsync();

      if (!networkState.isConnected || networkState.isInternetReachable === false) {
        setError('No internet connection. Please check your connection and try again.');
        return;
      }
      
      //Retrieve current weather for each bookmark
      const requests = bookmarks.map(async (location) => {
        const data = await getCurrentWeather(
          location.latitude,
          location.longitude
        );

        return {
          name: location.name,
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
        };
      });


    //Wait for all bookmarks
    const results = await Promise.all(requests);

    //Organize results by location
    const newWeatherData = {};

    results.forEach((result) => {
      newWeatherData[result.name] = {
        temperature: result.temperature,
        weatherCode: result.weatherCode,
      };
    });

    setWeatherData(newWeatherData);

  } catch (error) {
    console.log(error);
    setError('Unable to load bookmarked weather. Please check your internet connection.');
  }
}, [bookmarks]);

useEffect(() => {
  getBookmarkTemperatures();
}, [getBookmarkTemperatures]);

return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Bookmarks
        </Text>

        {/* Refresh */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={getBookmarkTemperatures}>

          <Image
            source={require('../assets/refreshIcon.png')}
            style={styles.refreshIcon}
            resizeMode="contain"/>

          <Text style={styles.refreshButtonText}>Refresh</Text>

        </TouchableOpacity>
      </View>


      {/* Region filter buttons */}
      {!error && bookmarks.length > 0 && (

        <View style={styles.filterRow}>

          {regions.map((region) => (
            <TouchableOpacity
              key={region}
              style={[styles.filterButton, selectedRegion === region &&styles.selectedFilterButton]}
              onPress={() => setSelectedRegion(region)}>
              <Text style={[styles.filterText, selectedRegion === region && styles.selectedFilterText]}>{region}</Text>
            </TouchableOpacity>
          ))}
        </View>

      )}

      {/* Error */}
      {error ? (

        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to Load Bookmarks</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>

        /* No Bookmarks at all */
        ) : bookmarks.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}> You currently do not have any existing bookmarks.</Text>
        </View>

        /* No bookmarks in region  */
        ) : filteredBookmarks.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>No Bookmarks Found</Text>
          <Text style={styles.noResultsText}>You have no bookmarks saved in this region.</Text>
        </View>
        ) : (

          /* Display Bookmarks */
          <FlatList
            data={filteredBookmarks}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => {
              const weather = weatherData[item.name];
              return (

                <View style={styles.locationRow}>
                  {/* Delete bookmark */}
                  <TouchableOpacity
                    onPress={() =>
                      toggleBookmark(item)
                    }>
                      <Image
                        source={require('../assets/redcross.png')}
                        style={styles.removeIcon}
                        resizeMode="contain"/>
                  </TouchableOpacity>

                  {/* Open Details Page */}
                  <TouchableOpacity
                    style={styles.locationContent}
                    onPress={() =>
                      navigation.navigate('Details',
                        {
                          location: item,
                        }
                      )
                    }>

                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{item.name}</Text>
                      <Text style={styles.locationRegion}>{item.region}</Text>
                    </View>

                    <View style={styles.tempRow}>

                      {weather && (
                        <Image
                          source={getWeatherDescription(weather.weatherCode)}
                          style={styles.weatherIcon}
                          resizeMode="contain"/>
                      )}

                      <Text style={styles.temperature}>
                        {weather
                          ? `${weather.temperature.toFixed(1)}°C`
                          : '...'}
                      </Text>

                      <Image
                        source={require('../assets/arrow.png')}
                        style={styles.arrowIcon}
                        resizeMode="contain"/>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}/>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  

//Header
  
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },

//Refresh

refreshButton: {
  backgroundColor: 'white',
  paddingVertical: 7,
  paddingHorizontal: 12,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
},

refreshIcon: {
  width: 18,
  height: 18,
  marginRight: 5,
},

refreshButtonText: {
  fontSize: 13,
  fontWeight: 'bold',
},


//Error

errorCard: {
  backgroundColor: 'white',
  padding: 22,
  borderRadius: 18,
  alignItems: 'center',
},

errorTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},

errorText: {
  fontSize: 14,
  color: '#D32F2F',
  textAlign: 'center',
},



//No Results

noResultsContainer: {
  backgroundColor: 'white',
  padding: 25,
  borderRadius: 14,
  alignItems: 'center',
},

noResultsTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#222',
  marginBottom: 6,
},

noResultsText: {
  fontSize: 14,
  color: '#777',
  textAlign: 'center',
},



//Filter by Region


filterRow: {
  flexDirection: 'row',
  marginBottom: 20,
},

filterButton: {
  flex: 1,
  backgroundColor: 'white',
  paddingVertical: 10,
  marginRight: 6,
  borderRadius: 8,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
},

selectedFilterButton: {
  backgroundColor: '#007FFF',
  borderColor: '#007FFF',
},

filterText: {
  fontSize: 14,
  color: '#555',
  fontWeight: '600',
},

selectedFilterText: {
  color: 'white',
},



//Display Bookmark


  locationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 18,      
  paddingVertical: 12,        
  minHeight: 90,           
  borderBottomWidth: 1,
  borderBottomColor: '#eeeeee',
  },

  removeIcon: {
  width: 20,
  height: 20,
  marginRight: 20,
  },

  locationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  locationInfo: {
    flex: 1,
  },

  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },


  weatherIcon: {
    width: 40,
    height: 40,
    marginRight:10,
  },

  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  temperature: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },


  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

  arrowIcon: {
  width: 20,
  height: 20,
  marginLeft: 10,
  },
  

});