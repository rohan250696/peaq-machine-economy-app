import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { usePrivy, useWallets } from '../hooks/usePlatformAuth';
import { useAccount, useChainId, useSwitchChain } from '../hooks/usePlatformWagmi';

interface PeaqNetworkStatusProps {
  onNetworkSwitch?: () => void;
  showSwitchButton?: boolean;
}

export default function PeaqNetworkStatus({ 
  onNetworkSwitch, 
  showSwitchButton = true 
}: PeaqNetworkStatusProps) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);

  const isOnPeaqNetwork = chainId === 3338;
  const isReady = authenticated && isConnected;

  const handleSwitchToPeaq = async () => {
    if (!switchChain) {
      Alert.alert('Error', 'Chain switching not available');
      return;
    }

    setIsSwitching(true);
    try {
      await switchChain({ chainId: 3338 });
      onNetworkSwitch?.();
    } catch (error) {
      console.error('Failed to switch to Peaq Network:', error);
      Alert.alert(
        'Network Switch Failed',
        `Failed to switch to Peaq Network: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <View style={[styles.statusIndicator, styles.disconnected]} />
        <Text style={styles.statusText}>Connecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.statusIndicator, 
        isOnPeaqNetwork ? styles.connected : styles.wrongNetwork
      ]} />
      <View style={styles.statusInfo}>
        <Text style={styles.statusText}>
          {isOnPeaqNetwork ? 'Connected to Peaq Network' : 'Wrong Network'}
        </Text>
        <Text style={styles.chainText}>
          Chain ID: {chainId} {isOnPeaqNetwork ? '(Peaq)' : '(Not Peaq)'}
        </Text>
      </View>
      
      {showSwitchButton && !isOnPeaqNetwork && (
        <TouchableOpacity
          style={[styles.switchButton, isSwitching && styles.switchButtonDisabled]}
          onPress={handleSwitchToPeaq}
          disabled={isSwitching}
        >
          <Text style={styles.switchButtonText}>
            {isSwitching ? 'Switching...' : 'Switch to Peaq'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  connected: {
    backgroundColor: '#00AEEF',
  },
  wrongNetwork: {
    backgroundColor: '#FF6B6B',
  },
  disconnected: {
    backgroundColor: '#A7A6A5',
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NB International Pro',
  },
  chainText: {
    color: '#A7A6A5',
    fontSize: 12,
    fontFamily: 'NB International Pro',
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: '#00AEEF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  switchButtonDisabled: {
    backgroundColor: '#666666',
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'NB International Pro',
  },
});
