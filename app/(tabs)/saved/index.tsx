import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useProjects } from '@/providers/ProjectsProvider';
import ProjectCard from '@/components/ProjectCard';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { bookmarkedProjects } = useProjects();

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.headerTitle}>Saved</Text>
      <Text style={styles.headerSubtitle}>
        {bookmarkedProjects.length} project{bookmarkedProjects.length !== 1 ? 's' : ''} bookmarked
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Bookmark size={32} color={Colors.textLight} />
      </View>
      <Text style={styles.emptyTitle}>No saved projects yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the bookmark icon on any project to save it here for quick access
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarkedProjects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProjectCard project={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500' as const,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
