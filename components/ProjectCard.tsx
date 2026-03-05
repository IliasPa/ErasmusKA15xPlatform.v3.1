import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Calendar, Users, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Project, PROJECT_TYPES } from '@/types/project';
import { COUNTRY_FLAGS } from '@/constants/countries';
import { useProjects } from '@/providers/ProjectsProvider';

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { toggleBookmark, isBookmarked } = useProjects();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarked = isBookmarked(project.id);

  const handlePress = useCallback(() => {
    router.push(`/project/${project.id}`);
  }, [project.id, router]);

  const handleBookmark = useCallback(() => {
    toggleBookmark(project.id);
  }, [project.id, toggleBookmark]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const flag = COUNTRY_FLAGS[project.destinationCountry] ?? '';
  const typeLabel = PROJECT_TYPES[project.type] ?? project.type;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`project-card-${project.id}`}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: project.coverImage }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.imageOverlay} />
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{project.type}</Text>
          </View>
          <Pressable
            onPress={handleBookmark}
            style={styles.bookmarkButton}
            hitSlop={12}
            testID={`bookmark-${project.id}`}
          >
            {bookmarked ? (
              <BookmarkCheck size={22} color={Colors.accent} fill={Colors.accent} />
            ) : (
              <Bookmark size={22} color={Colors.white} />
            )}
          </Pressable>
        </View>
        <View style={styles.content}>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
          <Text style={styles.title} numberOfLines={2}>{project.title}</Text>
          <View style={styles.metaRow}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.metaText}>
              {flag} {project.city}, {project.destinationCountry}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Calendar size={14} color={Colors.primary} />
            <Text style={styles.metaText}>
              {formatDate(project.startDate)} – {formatDate(project.endDate)}, {project.year}
            </Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.ngoChip}>
              <Text style={styles.ngoText}>{project.ngoName}</Text>
            </View>
            <View style={styles.spotsChip}>
              <Users size={12} color={Colors.primary} />
              <Text style={styles.spotsText}>{project.participantSpots} spots</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(ProjectCard);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
  },
  ngoChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  ngoText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  spotsChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  spotsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
