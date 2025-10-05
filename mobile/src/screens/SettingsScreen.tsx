import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useClipboard } from '../context/ClipboardContext';

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOffline, refreshItems } = useClipboard();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleSync = async () => {
    try {
      await refreshItems();
      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }> = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        <Icon name="chevron-forward" size={20} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOffline ? '#FF6B6B' : '#4CAF50' }]}>
            <Text style={styles.statusText}>
              {isOffline ? 'Offline' : 'Online'}
            </Text>
          </View>
        </View>
      </View>

      {/* Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synchronization</Text>
        <SettingItem
          icon="sync"
          title="Sync Now"
          subtitle="Sync clipboard data with server"
          onPress={handleSync}
        />
        <SettingItem
          icon="cloud"
          title="Auto Sync"
          subtitle="Automatically sync when online"
          rightElement={<Switch value={true} onValueChange={() => {}} />}
        />
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <SettingItem
          icon="shield-checkmark"
          title="Data Encryption"
          subtitle="Encrypt sensitive clipboard data"
          rightElement={<Switch value={true} onValueChange={() => {}} />}
        />
        <SettingItem
          icon="time"
          title="Auto Delete"
          subtitle="Delete old items after 30 days"
          rightElement={<Switch value={false} onValueChange={() => {}} />}
        />
        <SettingItem
          icon="eye-off"
          title="Private Mode"
          subtitle="Don't save sensitive content"
          rightElement={<Switch value={false} onValueChange={() => {}} />}
        />
      </View>

      {/* AI Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Features</Text>
        <SettingItem
          icon="bulb"
          title="Smart Suggestions"
          subtitle="AI-powered action suggestions"
          rightElement={<Switch value={true} onValueChange={() => {}} />}
        />
        <SettingItem
          icon="analytics"
          title="Content Analysis"
          subtitle="Analyze clipboard content for entities"
          rightElement={<Switch value={true} onValueChange={() => {}} />}
        />
        <SettingItem
          icon="language"
          title="Auto Translation"
          subtitle="Detect and offer translations"
          rightElement={<Switch value={false} onValueChange={() => {}} />}
        />
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingItem
          icon="notifications"
          title="Notifications"
          subtitle="Push notifications for new suggestions"
          rightElement={<Switch value={true} onValueChange={() => {}} />}
        />
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Use dark theme"
          rightElement={<Switch value={false} onValueChange={() => {}} />}
        />
        <SettingItem
          icon="refresh"
          title="Background Refresh"
          subtitle="Keep app updated in background"
          rightElement={<Switch value={true} onValueChange={() => {}} />}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          icon="information-circle"
          title="App Version"
          subtitle="1.0.0 (Build 1)"
        />
        <SettingItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help and contact support"
        />
        <SettingItem
          icon="document-text"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
        />
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Epitychia Smart Clipboard Manager
        </Text>
        <Text style={styles.footerSubtext}>
          Made with ❤️ for productivity
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default SettingsScreen;