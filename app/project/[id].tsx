import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert, Animated, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, MapPin, Calendar, Users, Building2, FileText, ExternalLink,
  Bookmark, BookmarkCheck, Globe, Clock, ChevronDown, Check,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PROJECT_TYPES } from '@/types/project';
import { COUNTRY_FLAGS } from '@/constants/countries';
import { useProjects } from '@/providers/ProjectsProvider';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProjectById, toggleBookmark, isBookmarked } = useProjects();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const project = getProjectById(id ?? '');
  const bookmarked = isBookmarked(id ?? '');

  const handleOpenLink = useCallback(async (url: string, label: string) => {
    if (!url) {
      Alert.alert('Not Available', `No ${label} link has been provided for this project.`);
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open', `Unable to open this ${label} link.`);
      }
    } catch (error) {
      console.log('Error opening URL:', error);
      Alert.alert('Error', 'Something went wrong opening the link.');
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDaysBetween = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!project) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Project not found</Text>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const flag = COUNTRY_FLAGS[project.destinationCountry] ?? '';
  const typeLabel = PROJECT_TYPES[project.type] ?? project.type;
  const duration = getDaysBetween(project.startDate, project.endDate);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: project.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.imageOverlay} />
          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <Pressable style={styles.topBarButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color={Colors.white} />
            </Pressable>
            <Pressable
              style={styles.topBarButton}
              onPress={() => toggleBookmark(project.id)}
            >
              {bookmarked ? (
                <BookmarkCheck size={20} color={Colors.accent} fill={Colors.accent} />
              ) : (
                <Bookmark size={20} color={Colors.white} />
              )}
            </Pressable>
          </View>
          <View style={styles.imageBottom}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{project.type}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
          <Text style={styles.title}>{project.title}</Text>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.quickInfoText}>
                {flag} {project.city}, {project.destinationCountry}
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.quickInfoText}>{duration} days</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.statValue}>
                {formatDate(project.startDate)}
              </Text>
              <Text style={styles.statLabel}>Start Date</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{project.participantSpots}</Text>
              <Text style={styles.statLabel}>Spots</Text>
            </View>
            <View style={styles.statCard}>
              <Globe size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{project.eligibleCountries.length}</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this project</Text>
            <Text style={styles.descriptionText}>{project.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organized by</Text>
            <View style={styles.ngoCard}>
              <View style={styles.ngoIcon}>
                <Building2 size={22} color={Colors.primary} />
              </View>
              <View style={styles.ngoInfo}>
                <Text style={styles.ngoName}>{project.ngoName}</Text>
                <Text style={styles.ngoCountry}>
                  {COUNTRY_FLAGS[project.ngoCountry] ?? ''} {project.ngoCountry}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participant Info</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age Range</Text>
                <Text style={styles.infoValue}>{project.ageRange}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{duration} days</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>End Date</Text>
                <Text style={styles.infoValue}>{formatDate(project.endDate)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Year</Text>
                <Text style={styles.infoValue}>{project.year}</Text>
              </View>
            </View>
          </View>

          {project.eligibleCountries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Your Country</Text>
              <Text style={styles.dropdownHint}>Choose your country of residence to get the correct application form</Text>
              <Pressable
                style={[styles.dropdownButton, dropdownOpen && styles.dropdownButtonOpen]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setDropdownOpen(prev => !prev);
                  Animated.timing(rotateAnim, {
                    toValue: dropdownOpen ? 0 : 1,
                    duration: 250,
                    useNativeDriver: true,
                  }).start();
                }}
                testID="country-dropdown"
              >
                <View style={styles.dropdownButtonContent}>
                  {selectedCountry ? (
                    <>
                      <Text style={styles.dropdownFlag}>{COUNTRY_FLAGS[selectedCountry] ?? ''}</Text>
                      <Text style={styles.dropdownSelectedText}>{selectedCountry}</Text>
                    </>
                  ) : (
                    <>
                      <Globe size={18} color={Colors.textLight} />
                      <Text style={styles.dropdownPlaceholder}>Select your country</Text>
                    </>
                  )}
                </View>
                <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
                  <ChevronDown size={20} color={Colors.textSecondary} />
                </Animated.View>
              </Pressable>
              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {project.eligibleCountries.map((country, index) => {
                    const isSelected = selectedCountry === country;
                    const isLast = index === project.eligibleCountries.length - 1;
                    return (
                      <Pressable
                        key={country}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, !isLast && styles.dropdownItemBorder]}
                        onPress={() => {
                          setSelectedCountry(country);
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setDropdownOpen(false);
                          Animated.timing(rotateAnim, {
                            toValue: 0,
                            duration: 250,
                            useNativeDriver: true,
                          }).start();
                        }}
                      >
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemFlag}>{COUNTRY_FLAGS[country] ?? ''}</Text>
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>{country}</Text>
                        </View>
                        {isSelected && <Check size={18} color={Colors.primary} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {project.topics.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Topics</Text>
              <View style={styles.topicsRow}>
                {project.topics.map(topic => (
                  <View key={topic} style={styles.topicChip}>
                    <Text style={styles.topicChipText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.infoPackButton}
          onPress={() => handleOpenLink(project.infoPack, 'infopack')}
          testID="infopack-button"
        >
          <FileText size={18} color={Colors.primary} />
          <Text style={styles.infoPackButtonText}>Infopack</Text>
        </Pressable>
        <Pressable
          style={[styles.applyButton, !selectedCountry && styles.applyButtonDisabled]}
          onPress={() => {
            const url = selectedCountry && project.applicationFormUrls?.[selectedCountry]
              ? project.applicationFormUrls[selectedCountry]
              : project.applicationFormUrl;
            if (!selectedCountry) {
              Alert.alert('Select Country', 'Please select your country of residence first to get the correct application form.');
              return;
            }
            handleOpenLink(url, 'application form');
          }}
          testID="apply-button"
        >
          <ExternalLink size={18} color={Colors.white} />
          <Text style={styles.applyButtonText}>{selectedCountry ? `Apply (${selectedCountry})` : 'Apply Now'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  imageContainer: {
    height: 260,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ngoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 14,
  },
  ngoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ngoInfo: {
    flex: 1,
  },
  ngoName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  ngoCountry: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  dropdownHint: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownButtonOpen: {
    borderColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownFlag: {
    fontSize: 20,
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: Colors.textLight,
  },
  dropdownList: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownItemFlag: {
    fontSize: 18,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  topicChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primaryDark,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  infoPackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  infoPackButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  applyButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
