import {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, ImageBackground, Image} from 'react-native';
import { getWeatherForecast } from '../api/weatherApi';
import { getWeatherDescription } from '../util/weatherDesc';
import { getHour, formatHour, getDateOptions, getHourlyData, getForecastForDate, findWeatherByDateAndHour, getSelectedTimeLabel, getTimePeriod, isNightTime} from '../util/weatherTimeDate';
import * as Network from 'expo-network';

//Details screen components
export default function DetailsScreen({route, bookmarks, toggleBookmark,}) 
{
  const location = route?.params?.location;
  const latitude = location.latitude;
  const longitude = location.longitude;
  const isBookmarked = bookmarks?.some((item) => item.name === location.name) ?? false;
  
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeather, setSelectedWeather,] = useState(null);
  const [selectedDate, setSelectedDate,] = useState(new Date().toLocaleDateString('en-CA'));


  //Retrieve weather based on location
  const getWeather = useCallback(async () => 
  {
    try {
      setLoading(true);
      setError(null);

      //Check internet connection
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || networkState.isInternetReachable === false) {
        setError('No internet connection. Please check your connection and try again.');
        return;
      }

      //Retrieve location infomation
      const data = await getWeatherForecast(latitude, longitude);

      //Save the weather data 
      setWeather(data);
    } catch (err) {
        
      //Error
      console.log(err);
      setError(err.message || 'Unable to connect. Please check your internet connection and try again.');
      } finally {
        //Remove loading 
        setLoading(false);
      }
  }, [latitude, longitude]);


  //Get weather on startup
  useEffect(() => {
    getWeather();
  }, [getWeather]);

  //Creates the selectable dates from 3 days ago to 7 days ahead
  const dateOptions = getDateOptions();

  //Retrive hourly data
  const allHourlyData = getHourlyData(weather);

  //Retrieve selected date forecast
  const selectedDateForecast = getForecastForDate(allHourlyData, selectedDate);

  //Runs when weather loads or when the selected date/time changes
  useEffect(() => {

    //Stop if weather has not loaded or an hour is already selected
    if (!weather || selectedWeather !== null) {
      return;
    }

    //Retrieve hourly data
    const hourlyData = getHourlyData(weather);

    //Retrieve the current hour from the device
    const currentHour = new Date().getHours();

    //Find the weather data matching the selected date and current hour
    const currentWeather = findWeatherByDateAndHour(hourlyData, selectedDate,currentHour);

    if (currentWeather) {
      //Set the current hour's weather as the selected weather
      setSelectedWeather(currentWeather);
    }
  }, [weather, selectedDate, selectedWeather]);

  //Styling for hour cards
  const getHourStyle = (item) => {

    //Retrieve the time period for each hour (day or night)
    const period = getTimePeriod(item);
    
    //Style changed to nighthour
    if (period === 'night') {
      return styles.nightHour;
    }

    //Style changed to dayhour
    return styles.dayHour;
  };
  

  //Display hour selection section (based on the selected day)
  const renderHourlyCard = (item) => {
    {/* Displays info and style based on the selected date & time.*/}
    const isSelected = selectedWeather?.time === item.time;
    const night = getTimePeriod(item) === 'night';  
    return (
      //Make each selection clickable
      <TouchableOpacity
        key={item.time}
        onPress={() => setSelectedWeather(item)}
        style={[styles.hourCell, getHourStyle(item), isSelected && styles.selectedHourCell,]}>

        {/* Display each hour */}
        <Text style={[styles.hourTime, night && !isSelected && styles.nightText,]}>
          {formatHour(item.time)}
        </Text>

        {/* Display selected weather (icon) of that hour*/}
        <Image
          source={getWeatherDescription(
            item.weatherCode,
            false,
            false,
            isNightTime(item)
          )}
          style={styles.hourWeatherIcon}
          resizeMode="contain"
        />
      
        {/* Display temperature for each hour*/}
        <Text style={[styles.hourTemp,night && !isSelected && styles.nightText,]}>
          {item.temperature}°C
        </Text>
      </TouchableOpacity>
    );
  };

  // Display each date in the date selector
  const renderDateCard = (item) => {
    
    //Check whether this date is currently selected
    const isSelectedDate = selectedDate === item.date;

    //Make each date clickable.
    //Pressing any it will update the currently selected date.
    //Shows the previous, current and next dates.
    return (
      <TouchableOpacity
        key={item.date}
        onPress={() => handleDateSelect(item.date)}
        style={[styles.dateCell, isSelectedDate && styles.selectedDateCell,]}>

        <Text style={styles.dateDay}>
          {item.offset === -1
            ? 'Yesterday'
            : item.offset === 0
            ? 'Today'
            : item.offset === 1
            ? 'Tomorrow'
            : ''
          }
        </Text>

        <Text style={styles.dateNumber}>
          {new Date(item.date + 'T00:00').getDate()}
        </Text>

        <Text style={styles.dateMonth}>
          {new Date(item.date + 'T00:00').toLocaleDateString('en-US',{month: 'short'})}
        </Text>

      </TouchableOpacity>
    );
  };

  //Change the background image depending on the selected time (day/night)
  const getBackgroundImage = () => {
    return isNightTime(selectedWeather)
      ? require('../assets/night.jpg')
      : require('../assets/sky.jpg');
  };



  //Handle date selection
  const handleDateSelect = (date) => {

    // Change yellow selected date
    setSelectedDate(date);

    // Use selected hour if there is one.
    // Otherwise use current hour.
    const hour = selectedWeather
      ? getHour(selectedWeather)
      : new Date().getHours();

    // Find the weather for:
    // selected date + selected hour
    const newSelectedWeather = findWeatherByDateAndHour(allHourlyData,date,hour);

    if (newSelectedWeather) {
      setSelectedWeather(newSelectedWeather);
    }
  };

 
//Details Screen
  return (
    <ImageBackground
      source={getBackgroundImage()}
      style={styles.backgroundImage}
      resizeMode="cover">

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.mainTitle}>Weather Forecast</Text>

          {/* Refresh */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={getWeather}
            disabled={loading}>
            <Image source={require('../assets/refreshIcon.png')} style={styles.refreshIcon} resizeMode="contain"/>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

      {/*Currently loading*/}
      {loading && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Retrieving weather Infomation...</Text>
        </View>
      )}

    {/* Error occurred after loading */}
    {!loading && error && (
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Unable to Load Weather</Text>

        {/*Error Message*/}
        <Text style={styles.error}>{error}</Text>

      </View>
    )}
      {/*Everything ok, load successful*/}
      {!loading && !error && weather && location  && (
          <>
            <View style={styles.weatherCard}>

              {/*Current or Selected Hour*/}
                <View style={styles.selectedHourRow}>
                  <Text style={styles.selectedHour}>
                    {getSelectedTimeLabel(selectedDate, selectedWeather)}
                  </Text>

                  {/* Bookmark */}
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleBookmark(location)}
                  >
                    <Text style={styles.bookmarkText}>
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Text>
                    <Image
                      source={
                        isBookmarked
                          ? require('../assets/isBookmarked.png')
                          : require('../assets/notBookmarked.png')
                      }
                      style={styles.bookmarkIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                  <Text style={styles.coordinates}>
                    {location.name}
                  </Text>

              {/*Current or Selected Temperature*/}
              <Text style={styles.mainTemperature}>
                {selectedWeather? selectedWeather.temperature : weather.current.temperature_2m}°C
              </Text>

            </View>

            {/*Display Current Weather*/}
            <View style = {styles.weatherInfo}>
              {/*Current or Selected Weather*/}
                <View style={styles.descriptionRow}>

                  {/* Weather Icon */}
                  <Image
                      source={getWeatherDescription(
                      selectedWeather
                        ? selectedWeather.weatherCode
                        : weather.current.weather_code,
                      false,
                      false,
                      isNightTime(selectedWeather)
                    )}
                    style={styles.mainWeatherIcon}
                    resizeMode="contain"
                  />

                {/* Weather Text */}
                <Text style={styles.currentDescription}>
                  {getWeatherDescription(
                    selectedWeather
                      ? selectedWeather.weatherCode
                      : weather.current.weather_code,
                    true,
                    false,
                    isNightTime(selectedWeather)
                  )}
                </Text>
              </View>
            </View>


            {/* Weather Advisory Section */}
            <View style={styles.forecastCard}>
              <Text style={styles.forecastTitle}> Weather Advisory </Text>
              <Text style={styles.advisoryText}>
                {getWeatherDescription(selectedWeather
                    ? selectedWeather.weatherCode
                    : weather.current.weather_code,
                  false,
                  true,
                  isNightTime(selectedWeather)
                )}
              </Text>
            </View>


            {/* Forecast time selection*/}
            <View style={styles.forecastCard}>
              <Text style={styles.forecastTitle}>Hourly Forecast</Text>
              <ScrollView  horizontal showsHorizontalScrollIndicator={false}>
                {selectedDateForecast.map(renderHourlyCard)}
              </ScrollView>
            </View>

         {/* Forecast date selection */}
         <View style={styles.forecastCard}>
          <Text style={styles.forecastTitle}>Date Selection</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dateOptions.map(renderDateCard)}
          </ScrollView>
        </View>



        {/* Additional Weather Info */}
          <View style={styles.infoRow}>
              {/*Current/Selected Humidity */}
              <View style={styles.infoBox}>
                <Image source={require('../assets/humidity.png')} style={styles.infoIcon} resizeMode="contain"/>
                <Text style={styles.infoLabel}>Humidity</Text>
                <Text style={styles.infoValue}>
                  {selectedWeather? selectedWeather.humidity: weather.current.relative_humidity_2m}%
                </Text>
              </View>

              {/*Current/Selected Rain Chance */}
               <View style={styles.infoBox}>
                <Image source={require('../assets/Umbrella.png')} style={styles.infoIcon} resizeMode="contain"/>
                <Text style={styles.infoLabel}>Rain Chance</Text>
                <Text style={styles.infoValue}>
                  {selectedWeather?.precipitationProbability ?? '--'}%
                </Text>
              </View>
            </View>

              
            <View style={styles.infoRow}>
              {/*Current/Selected feels like temperature */}
              <View style={styles.infoBox}>
                <Image source={require('../assets/temperature.png')} style={styles.infoIcon} resizeMode="contain"/>
                <Text style={styles.infoLabel}>Feels Like</Text>
                <Text style={styles.infoValue}>
                    {selectedWeather
                      ? selectedWeather.apparentTemperature
                      : weather.current.apparent_temperature}°C
                </Text>
              </View>

              {/*Current/Selected Wind Speed */}
              <View style={styles.infoBox}>
                <Image source={require('../assets/WindSpeed.png')} style={styles.infoIcon} resizeMode="contain"/>
                <Text style={styles.infoLabel}>Wind Speed</Text>
                <Text style={styles.infoValue}>
                  {selectedWeather? selectedWeather.windSpeed: weather.current.wind_speed_10m}km/h
                </Text>
              </View>
            </View>
          </>
        )}
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({


//Background flex
backgroundImage: {
  flex: 1,
},

//Header

headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

container: {
  flexGrow: 1,
  padding: 20,
  paddingBottom: 40,  
},

mainTitle: {
  fontSize: 25,
  fontWeight: 'bold',
  color: 'white',
},

//Bookmark

bookmarkButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f7fa',
  paddingVertical: 7,
  paddingHorizontal: 10,
  borderRadius: 18,
},

bookmarkText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#555',
  marginRight: 5,
},

bookmarkIcon: {
  width: 22,
  height: 22,
},

selectedHourRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},


//Loading

loadingContainer: {
  alignItems: 'center',
  paddingVertical: 50,
},

loadingText: {
  marginTop: 12,
  color: '#777',
},

//Refresh

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

error: {
  color: '#D32F2F',
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 20,
},

errorCard: {
  backgroundColor: 'white',
  padding: 22,
  borderRadius: 18,
},

errorTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 10,
},

//Main Weather Card
  
weatherCard: {
  backgroundColor: 'white',
  padding: 22,
  borderRadius: 18,
},

selectedHour: {
  fontSize: 22,
  fontWeight: 'bold',
},

coordinates: {
  color: '#888',
  marginTop: 5,
},

mainTemperature: {
  fontSize: 54,
  fontWeight: 'bold',
  marginVertical: 18,
  textAlign: 'center',
},

//Main Weather Description

weatherInfo:{
  paddingTop: 12,
},

mainWeatherIcon: {
  width: 50,
  height: 50,
  marginRight: 8,
},

currentDescription: {
  fontSize: 18,
  color: '#555',
},

descriptionRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#D9F0FA',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 20,
},

//Shared css

forecastCard: {
  marginTop: 10,
  backgroundColor: "white",
  padding: 10, 
  borderRadius: 10,
},

forecastTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#222',
  marginBottom: 10,
  marginLeft: 4,
},

//Weather Advisory

advisoryText: {
  backgroundColor: 'white',
  padding: 15,
  borderRadius: 12,
  fontSize: 15,
  lineHeight: 22,
},

//Hourly forecast

hourCell: {
  width: 70,
  height: 100,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 12,

  borderWidth: 1,
  borderColor: 'black',
},

nightHour: {
  backgroundColor: '#243B6B',
},

dayHour: {
  backgroundColor: '#007FFF',
},

hourTime: {
  fontSize: 15,
  fontWeight: 'bold',
  marginBottom: 8,
},

hourTemp: {
  fontSize: 16,
  fontWeight: 'bold',
},

nightText: {
  color: 'white',
},

selectedHourCell: {
  backgroundColor: '#E8A33D',
},

hourWeatherIcon: {
  width: 25,
  height: 25,
  marginVertical: 6,
},

//Date Selection

dateCell: {
  width: 85,
  height: 90,
  backgroundColor: '#eeeeee',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 8,
  borderWidth: 1,
  borderColor: 'black',
},

selectedDateCell: {
  backgroundColor: '#E8A33D',
},

dateDay: {
  fontSize: 11,
  marginBottom: 3,
},

dateNumber: {
  fontSize: 22,
  fontWeight: 'bold',
},

dateMonth: {
  fontSize: 12,
  marginTop: 2,
},


//Css for additional Weather Infomation

infoRow: {
  flexDirection: 'row',
  gap: 12,
  paddingTop: 10,  
},

infoBox: {
  flex: 1,
  backgroundColor: '#D9F0FA',
  padding: 14,
  minHeight: 85,
  borderRadius: 12,
  justifyContent: 'center',
},

infoLabel: {
  color: '#444',
  fontSize: 13,
  fontWeight: '500',
},

infoValue: {
  fontSize: 17,
  fontWeight: 'bold',
  marginTop: 4,
  color: '#111',
},

infoIcon: {
  width: 28,
  height: 28,
  marginBottom: 5,
},

});