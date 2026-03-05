import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform,
  Modal, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Plus, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { EU_COUNTRIES, COUNTRY_FLAGS } from '@/constants/countries';
import { PROJECT_TYPES, Project } from '@/types/project';
import { useProjects } from '@/providers/ProjectsProvider';

type PickerField = 'destinationCountry' | 'ngoCountry' | 'type' | 'eligibleCountries' | null;

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
];

interface FormData {
  title: string;
  type: keyof typeof PROJECT_TYPES | '';
  description: string;
  destinationCountry: string;
  city: string;
  startDate: string;
  endDate: string;
  ngoName: string;
  ngoCountry: string;
  eligibleCountries: string[];
  ageRange: string;
  participantSpots: string;
  infoPack: string;
  applicationFormUrl: string;
}

const initialFormData: FormData = {
  title: '',
  type: '',
  description: '',
  destinationCountry: '',
  city: '',
  startDate: '',
  endDate: '',
  ngoName: '',
  ngoCountry: '',
  eligibleCountries: [],
  ageRange: '',
  participantSpots: '',
  infoPack: '',
  applicationFormUrl: '',
};

export default function AddProjectScreen() {
  const insets = useSafeAreaInsets();
  const { addProject } = useProjects();
  const [form, setForm] = useState<FormData>(initialFormData);
  const [activePicker, setActivePicker] = useState<PickerField>(null);
  const [submitted, setSubmitted] = useState(false);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleEligibleCountry = useCallback((country: string) => {
    setForm(prev => {
      const exists = prev.eligibleCountries.includes(country);
      return {
        ...prev,
        eligibleCountries: exists
          ? prev.eligibleCountries.filter(c => c !== country)
          : [...prev.eligibleCountries, country],
      };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.title || !form.type || !form.destinationCountry || !form.city ||
        !form.ngoName || !form.ngoCountry || !form.startDate || !form.endDate) {
      Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
      return;
    }

    const startYear = new Date(form.startDate).getFullYear();
    const randomCover = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];

    const projectData: Omit<Project, 'id' | 'createdAt'> = {
      title: form.title,
      type: form.type as Project['type'],
      description: form.description,
      destinationCountry: form.destinationCountry,
      city: form.city,
      startDate: form.startDate,
      endDate: form.endDate,
      year: isNaN(startYear) ? new Date().getFullYear() : startYear,
      ngoName: form.ngoName,
      ngoCountry: form.ngoCountry,
      eligibleCountries: form.eligibleCountries,
      topics: [],
      ageRange: form.ageRange || '18-30',
      participantSpots: parseInt(form.participantSpots, 10) || 20,
      infoPack: form.infoPack || '',
      applicationFormUrl: form.applicationFormUrl || '',
      coverImage: randomCover,
    };

    addProject(projectData);
    setForm(initialFormData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    console.log('Project submitted:', form.title);
  }, [form, addProject]);

  const getPickerData = useCallback(() => {
    if (activePicker === 'type') {
      return Object.entries(PROJECT_TYPES).map(([k, v]) => ({ key: k, label: `${k} – ${v}` }));
    }
    return EU_COUNTRIES.map(c => ({ key: c, label: `${COUNTRY_FLAGS[c] ?? ''} ${c}` }));
  }, [activePicker]);

  const handlePickerSelect = useCallback((key: string) => {
    if (activePicker === 'eligibleCountries') {
      toggleEligibleCountry(key);
      return;
    }
    if (activePicker === 'type') {
      updateField('type', key as FormData['type']);
    } else if (activePicker === 'destinationCountry') {
      updateField('destinationCountry', key);
    } else if (activePicker === 'ngoCountry') {
      updateField('ngoCountry', key);
    }
    setActivePicker(null);
  }, [activePicker, toggleEligibleCountry, updateField]);

  const renderPickerField = (
    label: string,
    field: PickerField,
    value: string,
    required = false,
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <Pressable
        style={styles.pickerButton}
        onPress={() => setActivePicker(field)}
      >
        <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>Add Project</Text>
          <Text style={styles.headerSubtitle}>Share your Erasmus+ opportunity with the community</Text>
        </View>

        {submitted && (
          <View style={styles.successBanner}>
            <Check size={18} color={Colors.white} />
            <Text style={styles.successText}>Project added successfully!</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Project Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Green Future: Environmental Action"
              placeholderTextColor={Colors.textLight}
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              testID="input-title"
            />
          </View>

          {renderPickerField(
            'Project Type',
            'type',
            form.type ? `${form.type} – ${PROJECT_TYPES[form.type] ?? ''}` : '',
            true,
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the project, activities, and objectives..."
              placeholderTextColor={Colors.textLight}
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Dates</Text>

          {renderPickerField('Destination Country', 'destinationCountry', form.destinationCountry ? `${COUNTRY_FLAGS[form.destinationCountry] ?? ''} ${form.destinationCountry}` : '', true)}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lisbon"
              placeholderTextColor={Colors.textLight}
              value={form.city}
              onChangeText={(v) => updateField('city', v)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Start Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
                value={form.startDate}
                onChangeText={(v) => updateField('startDate', v)}
              />
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>End Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
                value={form.endDate}
                onChangeText={(v) => updateField('endDate', v)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NGO Information</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>NGO Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. EcoYouth Portugal"
              placeholderTextColor={Colors.textLight}
              value={form.ngoName}
              onChangeText={(v) => updateField('ngoName', v)}
            />
          </View>

          {renderPickerField('NGO Country', 'ngoCountry', form.ngoCountry ? `${COUNTRY_FLAGS[form.ngoCountry] ?? ''} ${form.ngoCountry}` : '', true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Eligible Countries</Text>
            <Pressable
              style={styles.pickerButton}
              onPress={() => setActivePicker('eligibleCountries')}
            >
              <Text style={[styles.pickerButtonText, form.eligibleCountries.length === 0 && styles.placeholderText]}>
                {form.eligibleCountries.length > 0
                  ? `${form.eligibleCountries.length} countries selected`
                  : 'Select eligible countries'}
              </Text>
              <ChevronDown size={16} color={Colors.textSecondary} />
            </Pressable>
            {form.eligibleCountries.length > 0 && (
              <View style={styles.tagsRow}>
                {form.eligibleCountries.map(c => (
                  <View key={c} style={styles.tag}>
                    <Text style={styles.tagText}>{COUNTRY_FLAGS[c] ?? ''} {c}</Text>
                    <Pressable onPress={() => toggleEligibleCountry(c)} hitSlop={8}>
                      <X size={12} color={Colors.primary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Age Range</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 18-30"
                placeholderTextColor={Colors.textLight}
                value={form.ageRange}
                onChangeText={(v) => updateField('ageRange', v)}
              />
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Spots</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 30"
                placeholderTextColor={Colors.textLight}
                value={form.participantSpots}
                onChangeText={(v) => updateField('participantSpots', v)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Infopack URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={Colors.textLight}
              value={form.infoPack}
              onChangeText={(v) => updateField('infoPack', v)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Application Form URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={Colors.textLight}
              value={form.applicationFormUrl}
              onChangeText={(v) => updateField('applicationFormUrl', v)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit} testID="submit-project">
          <Plus size={20} color={Colors.white} />
          <Text style={styles.submitButtonText}>Publish Project</Text>
        </Pressable>
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
                {activePicker === 'type' ? 'Project Type' :
                 activePicker === 'eligibleCountries' ? 'Eligible Countries' :
                 activePicker === 'destinationCountry' ? 'Destination Country' :
                 'NGO Country'}
              </Text>
              <Pressable onPress={() => setActivePicker(null)} hitSlop={12}>
                {activePicker === 'eligibleCountries' ? (
                  <View style={styles.doneButton}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </View>
                ) : (
                  <X size={22} color={Colors.text} />
                )}
              </Pressable>
            </View>
            <FlatList
              data={getPickerData()}
              keyExtractor={item => item.key}
              renderItem={({ item }) => {
                const isSelected = activePicker === 'eligibleCountries' &&
                  form.eligibleCountries.includes(item.key);
                return (
                  <Pressable
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handlePickerSelect(item.key)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                    {isSelected && <Check size={18} color={Colors.primary} />}
                  </Pressable>
                );
              }}
              style={styles.optionList}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerButtonText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textLight,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  optionList: {
    paddingHorizontal: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionRowSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: 15,
    color: Colors.text,
  },
});
