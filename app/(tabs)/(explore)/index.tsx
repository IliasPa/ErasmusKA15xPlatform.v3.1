import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { FilterState } from '@/types/project';
import { useProjects, useFilteredProjects } from '@/providers/ProjectsProvider';
import ProjectCard from '@/components/ProjectCard';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading } = useProjects();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    year: null,
    destinationCountry: null,
    residenceCountry: null,
    type: null,
    search: '',
  });

  const filteredProjects = useFilteredProjects(filters);

  const activeFilterCount = [
    filters.year, filters.destinationCountry, filters.residenceCountry, filters.type,
  ].filter(Boolean).length;

  const handleSearchChange = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, search: text }));
  }, []);

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  const renderHeader = useCallback(() => (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Erasmus+</Text>
            <Text style={styles.headerSubtitle}>KA15x Project Finder</Text>
          </View>
          <View style={styles.euBadge}>
            <Text style={styles.euBadgeText}>EU</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, NGOs, cities..."
            placeholderTextColor={Colors.textLight}
            value={filters.search}
            onChangeText={handleSearchChange}
            testID="search-input"
          />
          {filters.search.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <X size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
          <View style={styles.searchDivider} />
          <Pressable
            onPress={() => setShowFilters(prev => !prev)}
            style={styles.filterToggle}
            hitSlop={8}
          >
            <SlidersHorizontal size={18} color={activeFilterCount > 0 ? Colors.primary : Colors.textSecondary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      {showFilters && (
        <FilterBar
          year={filters.year}
          destinationCountry={filters.destinationCountry}
          residenceCountry={filters.residenceCountry}
          type={filters.type}
          onYearChange={(v) => setFilters(prev => ({ ...prev, year: v }))}
          onDestinationChange={(v) => setFilters(prev => ({ ...prev, destinationCountry: v }))}
          onResidenceChange={(v) => setFilters(prev => ({ ...prev, residenceCountry: v }))}
          onTypeChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
        />
      )}
      <View style={styles.resultBar}>
        <Text style={styles.resultText}>
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  ), [insets.top, filters, showFilters, activeFilterCount, filteredProjects.length, handleSearchChange, clearSearch]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProjects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProjectCard project={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No projects found"
            subtitle="Try adjusting your filters or search terms to discover Erasmus+ opportunities"
          />
        }
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500' as const,
    marginTop: 2,
  },
  euBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  euBadgeText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  filterToggle: {
    position: 'relative' as const,
    padding: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  resultBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
});
