import React from 'react';
import { Modal, SafeAreaView, View, TouchableOpacity, TextInput, Text, FlatList } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import st, { IS_ANDROID, ORANGE, MUTED, HINT, TEXT } from './styles';
import AvatarImage from '@/components/common/AvatarImage';

export default function DiscoverSearch({ visible, query, setQuery, filteredPosts, onClose, onOpenPost }: any) {
  const Row = ({ item, index }: any) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 35).duration(280)}>
        <TouchableOpacity
          onPress={() => onOpenPost(item.id)}
          style={st.searchRow}
          activeOpacity={0.7}
        >
          <View style={st.searchAvatarWrap}>
            <AvatarImage src={item?.athlete?.avatarUrl ?? null} size={40} />
          </View>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={st.searchName}>
              {item.athlete.name}
            </Text>
            <Text allowFontScaling={false} style={st.searchCaption} numberOfLines={1}>
              {item.caption}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={MUTED} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <LinearGradient
        colors={['#11151a', '#0b0f14', '#0a0d12']}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={{
          flex: 1,
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
          <Animated.View entering={FadeInDown.duration(280)} style={st.searchHeader}>
            <TouchableOpacity onPress={() => { setQuery(''); onClose(); }} style={st.backBtn}>
              <Ionicons name="arrow-back" size={IS_ANDROID ? 18 : 20} color={TEXT ?? '#fff'} />
            </TouchableOpacity>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.035)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={st.searchBar}
            >
              <Ionicons name="search" size={15} color={MUTED} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search athletes or captions..."
                placeholderTextColor={HINT}
                style={st.searchInput}
                autoFocus
                allowFontScaling={false}
                selectionColor={ORANGE}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={15} color={MUTED} />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </Animated.View>

          {filteredPosts.length === 0 ? (
            <Animated.View entering={FadeIn.duration(260)} style={st.emptySearch}>
              <View style={st.emptyIconWrap}>
                <Ionicons name="search" size={32} color={MUTED} />
              </View>
              <Text allowFontScaling={false} style={st.emptyText}>
                No results found
              </Text>
            </Animated.View>
          ) : (
            <FlatList
              data={filteredPosts}
              keyExtractor={(p) => p.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 72 }} />
              )}
              renderItem={({ item, index }) => <Row item={item} index={index} />}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}
