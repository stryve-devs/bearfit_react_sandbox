import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { AppColors } from '../../constants/colors';
import AthleteCard from '../../components/home/AthleteCard';
import HomeBottomButtons from '../../components/home/HomeBottomButtons';
import HomeHeaderDropdown from '../../components/home/HomeHeaderDropdown';

type Athlete = {
  username: string;
  name: string;
  avatarUrl: string;
  // add more fields if needed
};

type HomeScreenProps = {
  athletes?: Athlete[]; // coming from AppState, optional to avoid undefined errors
  onOpenProfile?: (athlete: Athlete) => void; // optional handler for profile
};

export default function HomeScreen({ athletes = [], onOpenProfile }: HomeScreenProps) {
  // Dropdown state
  const [menuSelected, setMenuSelected] = useState('home');

  // Track followed athletes
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  // Safely take first 3 athletes
  const firstThreeAthletes = athletes.slice(0, 3);

  // Toggle follow/unfollow
  const toggleFollow = (username: string) => {
    setFollowed(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) newSet.delete(username);
      else newSet.add(username);
      return newSet;
    });
  };

  // Handle profile tap
  const openProfile = (athlete: Athlete) => {
    if (onOpenProfile) onOpenProfile(athlete);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Home / Discover dropdown */}
      <HomeHeaderDropdown
        options={[
          { key: 'home', label: 'Home' },
          { key: 'discover', label: 'Discover' },
        ]}
        selectedKey={menuSelected}
        onSelect={(key) => {
          setMenuSelected(key);
          if (key === 'discover') {
            console.log('Navigate to Discover screen');
            // navigation.navigate('Discover');
          }
        }}
      />

      {/* Horizontal athlete list */}
      <FlatList
        data={firstThreeAthletes}
        keyExtractor={(item) => item.username}
        horizontal
        renderItem={({ item }) => (
          <AthleteCard
            athlete={item}
            isFollowed={followed.has(item.username)}
            onToggleFollow={() => toggleFollow(item.username)}
            onPress={() => openProfile(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        showsHorizontalScrollIndicator={false}
      />

      {/* Grey placeholders */}
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholderCircle} />
        <View style={styles.placeholderBar} />
        <View style={[styles.placeholderBar, { width: 200 }]} />
      </View>

      {/* Bottom buttons */}
      <HomeBottomButtons
        onDiscoverPress={() => console.log('Navigate to Discover')}
        onConnectPress={() => console.log('Navigate to Contacts')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.black,
    padding: 12,
  },
  placeholderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  placeholderCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2A2A2A',
    marginBottom: 12,
  },
  placeholderBar: {
    width: 240,
    height: 10,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginBottom: 10,
  },
});