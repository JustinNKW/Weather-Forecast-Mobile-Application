import { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image} from 'react-native';
import * as Network from 'expo-network';
import { getCurrentWeather} from '../api/weatherApi';
import locations from '../data/locations.json';
import { getWeatherDotColor } from '../util/weatherDesc';

//Homescreen components
export default function MapScreen({ navigation }) {
  const [mapWeather, setMapWeather] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    getMapWeather();
  }, []);

  // Retrieve the current weather for each map location
  const getMapWeather = async () => {
    try {
      setError(null);
      // Check internet connection
      const networkState = await Network.getNetworkStateAsync();

      if (!networkState.isConnected || networkState.isInternetReachable === false) {
        setError('No internet connection detected. Please check your connection and try again.');
        return;
      }

    // Retrieve weather for all map locations
    const requests = locations.locations.map(async (location) => {
      const data = await getCurrentWeather(location.latitude, location.longitude);

      return {
        name: location.name,
        weatherCode: data.current.weather_code,
      };
    });

    //Wait until all weather for each map location is retrieved
    const results = await Promise.all(requests);

    //Assign the weather code based on the retrieved weather
    const weatherByLocation = {};

    results.forEach((result) => {
      weatherByLocation[result.name] = result.weatherCode;
    });

    setMapWeather(weatherByLocation);

    } catch (error) {
      console.log(error);
      setError('Unable to load weather information. Please check your internet connection.');
    }
  };

  return (
  <View style={styles.container}>

    {/* Header */}
    <View style={styles.headerRow}>
      <Text style={styles.title}> Map </Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={getMapWeather}>
        <Image source={require('../assets/refreshIcon.png')} style={styles.refreshIcon} resizeMode="contain"/>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>


    {/* Display Error */}
    {error ? (

      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Unable to Load Weather Map</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>

    ) : (

        <>
          {/* Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Weather Legend</Text>
            <View style={styles.legendRow}>

              {/* Clear - Yellow */}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot,{ backgroundColor: '#FFD54F' }]}/>
                <Text style={styles.legendText}>Clear</Text>
              </View>

              {/* Cloudy - Grey */}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot,{ backgroundColor: '#B0BEC5' }]}/>
                <Text style={styles.legendText}>Cloudy</Text>
              </View>

              {/* Rain - Blue */}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot,{ backgroundColor: '#2196F3' }]}/>
                <Text style={styles.legendText}>Rain</Text>
              </View>]

              {/* Thunderstorm - Purple */}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot,{ backgroundColor: '#7E57C2' }]}/>
                <Text style={styles.legendText}>Thunderstorm</Text>
              </View>

            </View>
          </View>

          {/* Scrollable map */}
          <View style={styles.mapViewport}>

            {/* Horizontal scrolling */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalContent}>

              {/* Vertical scrolling */}
              <ScrollView
                showsVerticalScrollIndicator={true}
                style={styles.verticalScroll}
                contentContainerStyle={styles.verticalContent}
                nestedScrollEnabled={true}>

                {/* Map background */}
                <ImageBackground
                  source={require('../assets/sgmap.jpg')}
                  style={styles.mapImage}
                  resizeMode="stretch">

                  {locations.locations.map((location) => (
                    <TouchableOpacity
                      key={location.name}
                      style={[styles.pointButton,
                        {
                          left: `${location.mapX}%`,
                          top: `${location.mapY}%`,
                        },
                      ]}
                      onPress={() =>
                        navigation.navigate('Details', {location})
                      }>

                      {/* Weather coloured dot */}
                      <View style={[styles.dot,{backgroundColor:getWeatherDotColor(mapWeather[location.name])}]}/>

                      {/* Location name */}
                      <Text style={styles.pointName}>{location.name}</Text>

                    </TouchableOpacity>
                  ))}
                </ImageBackground>
              </ScrollView>
            </ScrollView>
          </View>
        </>
      )}
    </View>
  ); 
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },


  //Legend

  legendContainer: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
  },

  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },

  legendText: {
    fontSize: 13,
    color: '#555',
  },


  //Map

  mapViewport: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f5f7fa',
  },

  horizontalScroll: {
    flex: 1,
    width: '100%',
  },

  horizontalContent: {
    minWidth: 1600,
  },

  verticalScroll: {
    flex: 1,
  },

  verticalContent: {
    minHeight: 1000,
  },

  mapImage: {
    width: 1600,
    height: 1000,
  },


  //Points

  pointButton: {
    position: 'absolute',
    alignItems: 'center',

    transform: [
      {
        translateX: -10,
      },
      {
        translateY: -10,
      },
    ],
  },

  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,

    borderWidth: 2,
    borderColor: 'white',
  },

  pointName: {
    fontSize: 10,
    fontWeight: '600',

    backgroundColor: 'white',

    paddingHorizontal: 5,
    paddingVertical: 2,

    borderRadius: 4,
    marginTop: 3,
  },

//Header 

  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 12,
},

title: {
  fontSize: 25,
  fontWeight: 'bold',
  color: '#222',
},

refreshButton: {
  backgroundColor: 'white',
  paddingVertical: 7,
  paddingHorizontal: 12,
  borderRadius: 10,
  flexDirection: 'row',
},

refreshButtonText: {
  color: 'black',
  fontSize: 13,
  fontWeight: 'bold',
},

refreshIcon: {
  width: 20,
  height: 20,
  marginRight:5,
},

//Error

errorCard: {
  backgroundColor: 'white',
  marginHorizontal: 16,
  padding: 22,
  borderRadius: 18,
  alignItems: 'center',
},

errorTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
},

errorText: {
  fontSize: 14,
  color: '#D32F2F',
  textAlign: 'center',
  lineHeight: 20,
},

});