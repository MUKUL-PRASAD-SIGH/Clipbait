import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useClipboard } from '../context/ClipboardContext';
import { ClipboardItem } from '../types';

const ClipboardScreen: React.FC = () => {
  const { items, isLoading, isOffline, selectItem, deleteItem, refreshItems } = useClipboard();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshItems();
    setRefreshing(false);
  };

  const handleItemPress = (item: ClipboardItem) => {
    selectItem(item);
    // Copy to clipboard
    Clipboard.setString(item.content);
    Alert.alert('Copied!', 'Content copied to clipboard');
  };

  const handleItemLongPress = (item: ClipboardItem) => {
    Alert.alert(
      'Actions',
      'What would you like to do?',
      [
        { text: 'Copy', onPress: () => Clipboard.setString(item.content) },
        { text: 'Share', onPress: () => Share.share({ message: item.content }) },
        { text: 'Delete', onPress: () => handleDelete(item.id), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteItem(id), style: 'destructive' },
      ]
    );
  };

  const renderItem = ({ item }: { item: ClipboardItem }) => {
    const preview = item.content.length > 100 
      ? item.content.substring(0, 100) + '...' 
      : item.content;

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'contact': return '👤';
        case 'event': return '📅';
        case 'location': return '📍';
        case 'document': return '📄';
        case 'code': return '💻';
        case 'url': return '🔗';
        default: return '📋';
      }
    };

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(item.metadata.category)}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
          {item.suggestions.length > 0 && (
            <View style={styles.suggestionBadge}>
              <Text style={styles.suggestionCount}>{item.suggestions.length}</Text>
              <Icon name="bulb" size={12} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.content} numberOfLines={3}>
          {preview}
        </Text>
        {item.entities.length > 0 && (
          <View style={styles.entitiesContainer}>
            {item.entities.slice(0, 3).map((entity, index) => (
              <View key={index} style={styles.entityTag}>
                <Text style={styles.entityText}>{entity.type}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Icon name="cloud-offline" size={16} color="#FFF" />
          <Text style={styles.offlineText}>Working Offline</Text>
        </View>
      )}
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No clipboard items yet</Text>
            <Text style={styles.emptySubtext}>
              Copy something to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  offlineBanner: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  offlineText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timestamp: {
    flex: 1,
    color: '#666',
    fontSize: 12,
  },
  suggestionBadge: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  suggestionCount: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  entitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  entityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  entityText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
});

export default ClipboardScreen;