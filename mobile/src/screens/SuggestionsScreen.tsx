import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useClipboardStore } from '../store/clipboardStore';
import { ActionSuggestion, ActionType } from '../types';

const SuggestionsScreen: React.FC = () => {
  const { selectedItem, suggestions, executeSuggestion } = useClipboardStore();

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'open_maps':
        return 'map-outline';
      case 'create_event':
        return 'calendar-outline';
      case 'call_phone':
        return 'call-outline';
      case 'send_email':
        return 'mail-outline';
      case 'open_url':
        return 'globe-outline';
      case 'add_contact':
        return 'person-add-outline';
      case 'create_note':
        return 'document-text-outline';
      case 'search_web':
        return 'search-outline';
      default:
        return 'flash-outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const handleSuggestionPress = async (suggestion: ActionSuggestion) => {
    try {
      switch (suggestion.type) {
        case 'open_url':
          await Linking.openURL(suggestion.metadata.url);
          break;
        case 'open_maps':
          const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(suggestion.metadata.address)}`;
          await Linking.openURL(mapsUrl);
          break;
        case 'send_email':
          const emailUrl = `mailto:${suggestion.metadata.email}`;
          await Linking.openURL(emailUrl);
          break;
        case 'call_phone':
          const telUrl = `tel:${suggestion.metadata.phone}`;
          await Linking.openURL(telUrl);
          break;
        case 'search_web':
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.metadata.query)}`;
          await Linking.openURL(searchUrl);
          break;
        default:
          await executeSuggestion(suggestion);
      }
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
    }
  };

  const renderSuggestion = ({ item }: { item: ActionSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionHeader}>
        <View style={styles.iconContainer}>
          <Icon
            name={getActionIcon(item.type)}
            size={24}
            color="#6366f1"
          />
        </View>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionTitle}>{item.title}</Text>
          <Text style={styles.suggestionDescription}>{item.description}</Text>
        </View>
        <View style={styles.confidenceContainer}>
          <Text
            style={[
              styles.confidenceText,
              { color: getConfidenceColor(item.confidence) },
            ]}
          >
            {Math.round(item.confidence * 100)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Suggestions</Text>
        {selectedItem && (
          <Text style={styles.subtitle}>
            For: {selectedItem.content.substring(0, 50)}
            {selectedItem.content.length > 50 ? '...' : ''}
          </Text>
        )}
      </View>

      {!selectedItem ? (
        <View style={styles.emptyContainer}>
          <Icon name="bulb-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No item selected</Text>
          <Text style={styles.emptySubtitle}>
            Select a clipboard item to see smart suggestions
          </Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="flash-off-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No suggestions available</Text>
          <Text style={styles.emptySubtitle}>
            This content doesn't have any actionable suggestions
          </Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedItem && (
        <View style={styles.itemDetails}>
          <Text style={styles.detailsTitle}>Item Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{selectedItem.contentType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{selectedItem.metadata.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entities:</Text>
            <Text style={styles.detailValue}>{selectedItem.entities.length}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Confidence:</Text>
            <Text
              style={[
                styles.detailValue,
                { color: getConfidenceColor(selectedItem.metadata.confidence) },
              ]}
            >
              {Math.round(selectedItem.metadata.confidence * 100)}%
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  itemDetails: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default SuggestionsScreen;