import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { Button } from './Button';
import { sharedStyles as styles, C } from '../theme';

export function ChessComCard({ username, games, onConnect, onRefresh, syncing, syncError }) {
  const [input, setInput] = useState(username || '');
  useEffect(() => { setInput(username || ''); }, [username]);
  const connect = () => { Keyboard.dismiss(); onConnect(input); };
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>OPTIONAL CONNECTION</Text>
    <Text style={styles.cardTitle}>Bring in your Chess.com games</Text>
    <Text style={styles.cardCopy}>{username ? `Connected as ${username} · ${games.length} games ready to review.` : 'Your daily practice needs no account. Connect a username when you want to review your public games.'}</Text>
    {username ? <Button title="Refresh my games" secondary busy={syncing} onPress={() => onRefresh(username)} /> : <>
      <TextInput accessibilityLabel="Chess.com username" value={input} onChangeText={setInput} autoCapitalize="none" autoCorrect={false}
        placeholder="Your Chess.com username" placeholderTextColor={C.faint} returnKeyType="go" onSubmitEditing={connect} style={styles.input} />
      <Button title="Connect account" secondary busy={syncing} onPress={connect} />
      <Text style={styles.privacyNote}>Public games only · No password needed</Text>
    </>}
    {!!syncError && <Text style={styles.errorText}>{syncError}</Text>}
  </View>;
}
