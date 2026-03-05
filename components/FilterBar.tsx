import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, FlatList, TextInput, ScrollView,
} from 'react-native';
import { ChevronDown, X, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { EU_COUNTRIES, COUNTRY_FLAGS } from '@/constants/countries';
import { PROJECT_TYPES } from '@/types/project';

interface FilterBarProps {
  year: number | null;
  destinationCountry: string | null;
  residenceCountry: string | null;
  type: string | null;
  onYearChange: (year: number | null) => void;
  onDestinationChange: (country: string | null) => void;
  onResidenceChange: (country: string | null) => void;
  onTypeChange: (type: string | null) => void;
}

const YEARS = [2024, 2025, 2026, 2027];

type PickerType = 'year' | 'destination' | 'residence' | 'type' | null;

function FilterBar({
  year, destinationCountry, residenceCountry, type,
  onYearChange, onDestinationChange, onResidenceChange, onTypeChange,
}: FilterBarProps) {
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const getPickerData = useCallback(() => {
    const q = pickerSearch.toLowerCase();
    switch (activePicker) {
      case 'year':
        return YEARS.map(y => ({ key: String(y), label: String(y) }));
      case 'destination':
      case 'residence':
        return EU_COUNTRIES
          .filter(c => c.toLowerCase().includes(q))
          .map(c => ({ key: c, label: `${COUNTRY_FLAGS[c] ?? ''} ${c}` }));
      case 'type':
        return Object.entries(PROJECT_TYPES).map(([k, v]) => ({ key: k, label: `${k} – ${v}` }));
      default:
        return [];
    }
  }, [activePicker, pickerSearch]);

  const handleSelect = useCallback((key: string) => {
    switch (activePicker) {
      case 'year': onYearChange(Number(key)); break;
      case 'destination': onDestinationChange(key); break;
      case 'residence': onResidenceChange(key); break;
      case 'type': onTypeChange(key); break;
    }
    setActivePicker(null);
    setPickerSearch('');
  }, [activePicker, onYearChange, onDestinationChange, onResidenceChange, onTypeChange]);

  const handleClear = useCallback((filterType: PickerType) => {
    switch (filterType) {
      case 'year': onYearChange(null); break;
      case 'destination': onDestinationChange(null); break;
      case 'residence': onResidenceChange(null); break;
      case 'type': onTypeChange(null); break;
    }
  }, [onYearChange, onDestinationChange, onResidenceChange, onTypeChange]);

  const renderChip = (
    filterType: PickerType,
    label: string,
    value: string | null,
    isActive: boolean,
  ) => (
    <View style={styles.chipWrapper} key={filterType}>
      <Pressable
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={() => { setActivePicker(filterType); setPickerSearch(''); }}
        testID={`filter-${filterType}`}
      >
        <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
          {value ?? label}
        </Text>
        <ChevronDown size={14} color={isActive ? Colors.white : Colors.textSecondary} />
      </Pressable>
      {isActive && (
        <Pressable
          style={styles.clearButton}
          onPress={() => handleClear(filterType)}
          hitSlop={8}
        >
          <X size={12} color={Colors.primary} />
        </Pressable>
      )}
    </View>
  );

  const showSearch = activePicker === 'destination' || activePicker === 'residence';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderChip('year', 'Year', year ? String(year) : null, !!year)}
        {renderChip('destination', 'Destination', destinationCountry, !!destinationCountry)}
        {renderChip('residence', 'My Country', residenceCountry, !!residenceCountry)}
        {renderChip('type', 'Type', type ? `${type}` : null, !!type)}
      </ScrollView>

      <Modal
        visible={activePicker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePicker(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === 'year' ? 'Select Year' :
                 activePicker === 'destination' ? 'Destination Country' :
                 activePicker === 'residence' ? 'Country of Residence' :
                 'Project Type'}
              </Text>
              <Pressable onPress={() => setActivePicker(null)} hitSlop={12}>
                <X size={22} color={Colors.text} />
              </Pressable>
            </View>
            {showSearch && (
              <View style={styles.searchRow}>
                <Search size={16} color={Colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search country..."
                  placeholderTextColor={Colors.textLight}
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  autoFocus
                />
              </View>
            )}
            <FlatList
              data={getPickerData()}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <Pressable style={styles.optionRow} onPress={() => handleSelect(item.key)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
              style={styles.optionList}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default React.memo(FilterBar);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    maxWidth: 120,
  },
  chipTextActive: {
    color: Colors.white,
  },
  clearButton: {
    marginLeft: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  searchRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  optionList: {
    paddingHorizontal: 8,
  },
  optionRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionText: {
    fontSize: 15,
    color: Colors.text,
  },
});
