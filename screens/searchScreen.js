import {useState } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import locations from '../data/locations.json';

export default function SearchScreen({ navigation }) {

  //There are five main regions in Singapore. All region is added.
  //Default selected region will be all.

  const [selectedRegion, setSelectedRegion] = useState('All');
  const regions = ['All', 'Central', 'North', 'South', 'East', 'West'];

  //Filter location by region if the selected button is not set to all.
  const filteredLocations = selectedRegion === 'All'
    ? locations.locations
    : locations.locations.filter((location) => 
    location.region === selectedRegion);

  //Display each location
  const renderLocation = ({ item }) => {

    return (
      //Allow each location to be clickable.
      //Clicking on a location will bring to its respective details page.
  
      <TouchableOpacity style={styles.locationRow}
        onPress={() => 
          navigation.navigate('Details', {location: item })}>
        
        <View>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationRegion}>{item.region}</Text>
        </View>
        <Image source={require('../assets/arrow.png')} style={styles.arrowIcon} resizeMode="contain"/>
      </TouchableOpacity>
    );
  };

  //Search Screen
  return (


    <View style={styles.container}>
      <Text style={styles.title}>
        Search by Region
      </Text>

      {/* List region filter buttons. Selecting a button will filter locations only for that region */}
      <View style={styles.filterRow}>
        {regions.map((region) => (

          
          <TouchableOpacity
            key={region}
            style={[ styles.filterButton, selectedRegion === region && styles.selectedFilterButton]}
            onPress={() =>
              setSelectedRegion(region)
            }>

            <Text style={[styles.filterText, selectedRegion === region && styles.selectedFilterText]}> {region} </Text>
          </TouchableOpacity>
        ))}

      </View>

      {/* List filtered locations. Filtered location depends on selected region.*/}
      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.name}
        renderItem={renderLocation}
        showsVerticalScrollIndicator={true}
      />

    </View>
  );
}

const styles = StyleSheet.create({


//Title
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },


//Filter Region Buttons
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


//Locations

  locationRow: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  locationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },

  locationRegion: {
    fontSize: 15,
    color: '#777',
    marginTop: 3,
  },

  arrowIcon: {
  width: 20,
  height: 20,
  marginRight:5,
  },

});