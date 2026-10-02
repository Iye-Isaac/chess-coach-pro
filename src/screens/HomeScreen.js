import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import styles from './HomeScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge, Button, SectionTitle, GameRow } from '../components';
import { gameDate } from '../services/chessCom';

export function HomeScreen({
  username,
  games,
  onConnect,
  onRefresh,
  syncing,
  syncError,
  onOpenReview,
  onTab
}) {
  const [input, setInput] = useState(username || '');
  useEffect(() => {
    setInput(username || '');
  }, [username]);
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.hero}>
      <View style={styles.heroTop}><Badge tone="amber">YOUR PERSONAL CHESS COACH</Badge>
        <Text style={styles.heroCrown}>♛</Text></View>
      <Text style={styles.heroTitle}>Play with{`\n`}more purpose.</Text>
      <Text style={styles.heroSub}>A little reflection. A clearer plan. A stronger next game.</Text>
      <View style={styles.heroRule} />
      <Text style={styles.heroFoot}>A better player is built one thoughtful move at a time.</Text>
    </View>

    {!username ? <View style={styles.card}>
      <View style={styles.cardTop}><View style={styles.cardIcon}><Text style={styles.cardIconText}>♟</Text></View>
        <Badge>STEP 01</Badge></View>
      <Text style={styles.cardTitle}>Start with your games</Text>
      <Text style={styles.cardCopy}>Connect your Chess.com username to bring in your recent games and shape a training plan around your play.</Text>
      <Text style={styles.inputLabel}>CHESS.COM USERNAME</Text>
      <TextInput value={input} onChangeText={setInput} autoCapitalize="none" autoCorrect={false} placeholder="Your username" placeholderTextColor="#a7a99f" returnKeyType="go" onSubmitEditing={() => {
        Keyboard.dismiss();
        onConnect(input);
      }} style={styles.input} />
      {!!syncError && <Text style={styles.errorText}>{syncError}</Text>}
      <Button title="Connect account  →" onPress={() => {
        Keyboard.dismiss();
        onConnect(input);
      }} busy={syncing} />
      <Text style={styles.privacyNote}>Chess.com public games only · No password needed</Text>
    </View> : <View style={styles.card}>
      <View style={styles.cardTop}><View style={styles.cardIcon}><Text style={styles.cardIconText}>✓</Text></View>
        <Badge>CONNECTED</Badge></View>
      <Text style={styles.cardTitle}>Welcome back, {username}</Text>
      <Text style={styles.cardCopy}>Your recent Chess.com games are ready. Your game data stays on this device.</Text>
      <View style={styles.statsStrip}>
        <View style={styles.stat}><Text style={styles.statValue}>{games.length}</Text>
        <Text style={styles.statLabel}>GAMES SYNCED</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>30</Text>
        <Text style={styles.statLabel}>DAYS REVIEWED</Text></View>
      </View>
      <Button title="Refresh my games" onPress={() => onRefresh(username)} secondary busy={syncing} />
      {!!syncError && <Text style={styles.errorText}>{syncError}</Text>}
    </View>}

    <SectionTitle eyebrow="YOUR NEXT STEP" title="Build your training habit" />
    <View style={styles.focusCard}><View style={styles.focusIcon}><Text style={styles.focusIconText}>✦</Text></View>
        <View style={{
        flex: 1
      }}><Text style={styles.focusTitle}>Make time for one puzzle</Text>
        <Text style={styles.focusCopy}>A few focused minutes can change how you see the board.</Text></View>
        <Pressable onPress={() => onTab('train')} style={styles.roundArrow}><Text style={styles.roundArrowText}>→</Text></Pressable></View>

    <View style={styles.quickGrid}>
      {[['progress', '◷', 'Progress', 'Recent results'], ['history', '♟', 'Game history', 'Return to a game'], ['learning', '✦', 'Learning path', 'Your weekly plan'], ['profile', '⚙', 'Profile & settings', 'Preferences & privacy']].map(([tab, icon, title, note]) => <Pressable key={tab} onPress={() => onTab(tab)} style={({
        pressed
      }) => [styles.quickCard, pressed && styles.pressed]}><Text style={styles.quickIcon}>{icon}</Text>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickNote}>{note}</Text></Pressable>)}
    </View>

    <View style={styles.sectionHead}><View><Text style={styles.eyebrow}>FROM YOUR CHESS.COM ACCOUNT</Text>
        <Text style={styles.sectionTitle}>Recent games</Text></View>{games.length > 0 && <Pressable onPress={() => onTab('review')}><Text style={styles.linkText}>See all  →</Text></Pressable>}</View>
    {games.length ? games.slice(0, 3).map(game => <GameRow key={game.url || `${game.end_time}-${gameDate(game.end_time)}`} game={game} username={username} onPress={() => onOpenReview(game)} />) : <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>Connect your Chess.com account to see your games here.</Text></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
