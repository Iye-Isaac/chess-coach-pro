import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import styles from './LibraryScreen.styles';
import { Badge, Button, SectionTitle } from '../components';
import { resources } from '../data/resources';

export function LibraryScreen({
  onTab,
  onBack
}) {
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const visible = resources.filter(item => (category === 'ALL' || item.kind === category) && `${item.title} ${item.kind} ${item.author} ${item.note}`.toLowerCase().includes(query.toLowerCase()));
  if (selected) return <ScrollView contentContainerStyle={styles.page}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to library" onPress={() => setSelected(null)} style={styles.backButton}><Text style={styles.backText}>‹  Library</Text></Pressable>
    <View style={styles.pageIntro}><Badge tone="amber">{selected.kind} · STARTER GUIDE</Badge>
        <Text style={styles.pageTitle}>{selected.title}</Text>
        <Text style={styles.pageSubtitle}>{selected.author}</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>The idea</Text>
        <Text style={styles.cardCopy}>{selected.note}</Text>
        <Text style={styles.cardCopy}>Try this idea in a real position. Ask what your opponent is threatening, then choose a move that improves your pieces while keeping your king safe.</Text>
        <Button title="Put it into practice" onPress={() => onTab(selected.kind === 'TACTICS' ? 'train' : 'play')} />
        <Button title="Back to library" secondary onPress={() => setSelected(null)} /></View>
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.page}>
    {!!onBack && <Pressable accessibilityRole="button" accessibilityLabel="Back to learning path" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹  Learning path</Text></Pressable>}
    <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Learn, your way.</Text>
        <Text style={styles.pageSubtitle}>A few good ideas to carry into your next game.</Text></View>
    <SectionTitle eyebrow="Curated for your study" title="Explore the library" />
    <TextInput accessibilityLabel="Search library resources" value={query} onChangeText={setQuery} placeholder="Search lessons" placeholderTextColor={C.muted} style={styles.input} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRail}>{['ALL', 'OPENING', 'TACTICS', 'ENDGAME', 'BOOK'].map(item => <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Show ${item.toLowerCase()} resources`} onPress={() => setCategory(item)} style={[styles.filterChip, category === item && styles.filterChipActive]}><Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item.charAt(0) + item.slice(1).toLowerCase()}</Text></Pressable>)}</ScrollView>
    {visible.map((item, index) => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={`Read ${item.title}`} onPress={() => setSelected(item)} style={({
      pressed
    }) => [styles.resourceCard, pressed && styles.pressed]}><View style={{
        flex: 1
      }}><Text style={styles.resourceKind}>{item.kind.charAt(0) + item.kind.slice(1).toLowerCase()}</Text>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceAuthor}>{item.author}</Text>
        <Text style={styles.resourceNote}>{item.note}</Text></View>
        <Text style={styles.rowChevron}>›</Text></Pressable>)}
    {!visible.length && <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>No lessons match that search.</Text></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
