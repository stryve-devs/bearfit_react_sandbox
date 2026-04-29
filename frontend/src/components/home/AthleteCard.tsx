import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppColors } from '../../constants/colors';
import useResolvedImageUri from '@/hooks/useResolvedImageUri';
import AvatarImage from '@/components/common/AvatarImage';

type Athlete = {
  username: string;
  name: string;
  avatarUrl: string;
  // add more fields if needed
};

type AthleteCardProps = {
  athlete: Athlete;
  isFollowed: boolean;
  onToggleFollow: () => void;
  onPress: () => void;
};

export default function AthleteCard({
  athlete,
  isFollowed,
  onToggleFollow,
  onPress,
}: AthleteCardProps) {
  const { resolvedUri } = useResolvedImageUri(athlete?.avatarUrl);
  const [fallbackUrl, setFallbackUrl] = React.useState<string | null>(null);
  const PLACEHOLDER = 'https://i.pravatar.cc/150?img=12';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Avatar */}
      <TouchableOpacity onPress={onPress}>
        <AvatarImage src={athlete.avatarUrl} style={styles.avatar} />
      </TouchableOpacity>

      {/* Name */}
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.name} numberOfLines={1}>
          {athlete.name}
        </Text>
      </TouchableOpacity>

      {/* Feature label */}
      <Text style={styles.featureLabel}>Feature</Text>

      {/* Follow/Followed button */}
      <TouchableOpacity
        style={[
          styles.followButton,
          { borderColor: AppColors.orange },
        ]}
        onPress={onToggleFollow}
      >
        <Text style={[styles.followButtonText]}>
          {isFollowed ? 'Followed' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 104,
    height: 165,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2A2A',
    marginBottom: 8,
  },
  name: {
    color: AppColors.white,
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  featureLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    marginBottom: 8,
  },
  followButton: {
    width: '100%',
    height: 28,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: AppColors.orange,
    fontSize: 12,
    fontWeight: '600',
  },
});