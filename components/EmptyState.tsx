import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SearchX } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container} testID="empty-state">
      <View style={styles.iconCircle}>
        <SearchX size={32} color={Colors.textLight} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export default React.memo(EmptyState);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    paddingTop: 80,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
