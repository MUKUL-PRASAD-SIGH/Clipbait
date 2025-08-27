import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { useClipboardStore } from '../store/clipboardStore';
import { ClipboardItem } from '../types';

const ClipboardHistoryScreen: React.FC = () => {
  const {
    items,
    selectedItem,
    searchQuery,
    isLoading,
    selectItem,
    deleteItem,
    setSearchQuery,
    copyToClipboard,
  } = useClipboardStore();

  const [showSearch, setShowSearch] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entities.some(entity =>
        entity.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [items, searchQuery]);

  const getCategoryColor = (category: string) => {
    const colors = {
      contact: '#3b82f6',
      event: '#10b981',
      location: '#ef4444',
      document: '#f59e0b',
      code: '#8b5cf6',
      other: '#6b7280',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleDelete = (item: ClipboardItem) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this clipboard item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: ClipboardItem }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedItem?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => selectItem(item)}
    >
      <View style={styles.itemHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.metadata.category) },
          ]}
        >
          <Text style={styles.categoryText}>{item.metadata.category}</Text>
        </View>
        <Text style={styles.timeText}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </Text>
      </View>

      <Text style={styles.contentText}>{truncateContent(item.content)}</Text>

      {item.entities.length > 0 && (
        <View style={styles.entitiesContainer}>
          {item.entities.slice(0, 2).map((entity, index) => (
            <View key={index} style={styles.entityBadge}>
              <Text style={styles.entityText}>
                {entity.type}: {entity.value}
              </Text>
            </View>
          ))}
          {item.entities.length > 2 && (
            <Text style={styles.moreEntities}>
              +{item.entities.length - 2} more
            </Text>
          )}
        </View>
      )}

      {item.suggestions.length > 0 && (
        <Text style={styles.suggestionsText}>
          {item.suggestions.length} suggestion{item.suggestions.length !== 1 ? 's' : ''} available
        </Text>
      )}

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => copyToClipboard(item.content)}
        >
          <Icon name="copy-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Icon name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading clipboard history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Clipboard History</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Icon name="search-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        )}

        <Text style={styles.subtitle}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </Text>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No clipboard items</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'No items match your search.' : 'Copy something to get started!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchButton: {
    padding: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedItem: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  entitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  entityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  entityText: {
    fontSize: 12,
    color: '#374151',
  },
  moreEntities: {
    fontSize: 12,
    color: '#6b7280',
    alignSelf: 'center',
  },
  suggestionsText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
});

export default ClipboardHistoryScreen;