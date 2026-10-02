import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import styles from './LibraryScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge } from '../components';
import { resources } from '../data/resources';

export function LibraryScreen({
  onTab
}) {
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const visible = resources.filter(item => (category === 'ALL' || item.kind === category) && `${item.title} ${item.kind} ${item.author} ${item.note}`.toLowerCase().includes(query.toLowerCase()));
  if (selected) return <ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => setSelected(null)} style={styles.backButton}><Text style={styles.backText}>‹  Library</Text></Pressable>
    <View style={styles.pageIntro}><Badge tone="amber">{selected.kind} · STARTER GUIDE</Badge>
        <Text style={styles.pageTitle}>{selected.title}</Text>
        <Text style={styles.pageSubtitle}>{selected.author}</Text></View>
    <View style={styles.card}><Text style={styles.eyebrow}>THE IDEA</Text>
        <Text style={styles.cardCopy}>{selected.note}</Text>
        <Text style={styles.cardCopy}>Try this idea in a real position. Ask what your opponent is threatening, then choose a move that improves your pieces while keeping your king safe.</Text>
        <Button title="Put it into practice" onPress={() => onTab(selected.kind === 'TACTICS' ? 'train' : 'play')} />
        <Button title="Back to library" secondary onPress={() => setSelected(null)} /></View>
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">A LIBRARY THAT GROWS WITH YOU</Badge>
        <Text style={styles.pageTitle}>Learn, your way.</Text>
        <Text style={styles.pageSubtitle}>A few good ideas to carry into your next game.</Text></View>
    <View style={styles.resourceFeature}><Text style={styles.eyebrowLight}>A GOOD PLACE TO BEGIN</Text>
        <Text style={styles.resourceFeatureTitle}>Study the whole game.</Text>
        <Text style={styles.resourceFeatureCopy}>Build a clear foundation in openings, tactics, and endgames. Then connect the lessons to your own games.</Text>
        <Text style={styles.resourceFeatureMark}>♘</Text></View>
    <SectionTitle eyebrow="CURATED FOR YOUR STUDY" title="Explore the library" />
    <TextInput value={query} onChangeText={setQuery} placeholder="Search lessons" placeholderTextColor="#a7a99f" style={styles.input} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRail}>{['ALL', 'OPENING', 'TACTICS', 'ENDGAME', 'BOOK'].map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filterChip, category === item && styles.filterChipActive]}><Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    {visible.map((item, index) => <Pressable key={item.title} onPress={() => setSelected(item)} style={({
      pressed
    }) => [styles.resourceCard, pressed && styles.pressed]}><View style={[styles.resourceIcon, index % 2 === 0 ? styles.resourceIconGreen : styles.resourceIconAmber]}><Text style={styles.resourceIconText}>{['♜', '♙', '♔', '✦'][index % 4]}</Text></View>
        <View style={{
        flex: 1
      }}><Text style={styles.resourceKind}>{item.kind}</Text>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceAuthor}>{item.author}</Text>
        <Text style={styles.resourceNote}>{item.note}</Text></View>
        <Text style={styles.rowChevron}>›</Text></Pressable>)}
    {!visible.length && <View style={styles.smallEmpty}><Text style={styles.smallEmptyText}>No lessons match that search.</Text></View>}
    <View style={styles.bottomSpace} />
  </ScrollView>;
}
