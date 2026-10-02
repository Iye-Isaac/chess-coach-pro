import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './ProfileScreen.styles';
import { C, PIECE_NAMES } from '../theme';
import { Badge, Button, SectionTitle } from '../components';

export function ProfileScreen({
  username,
  profile,
  rating,
  onTab,
  onDisconnect,
  onUpdateProfile,
  onRestart
}) {
  return <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.pageIntro}><Badge tone="amber">YOUR SPACE</Badge>
        <Text style={styles.pageTitle}>Profile & settings</Text>
        <Text style={styles.pageSubtitle}>Manage your local preferences and connected game data.</Text></View>
    <View style={styles.card}><View style={styles.profileHero}><View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{username ? username.slice(0, 1).toUpperCase() : '♘'}</Text></View>
        <View style={{
          flex: 1
        }}><Text style={styles.cardTitle}>{username || 'Guest player'}</Text>
        <Text style={styles.bodyMuted}>{rating ? `Recent rating ${rating}` : 'Your progress is saved on this device.'}</Text></View></View>
      <SectionTitle eyebrow="CURRENT FOCUS" title={profile.goal || 'Improve tactics'} />
      {['Improve tactics', 'Understand my games', 'Learn openings'].map(item => <Pressable key={item} onPress={() => onUpdateProfile({
        ...profile,
        goal: item
      })} style={[styles.setupChoice, profile.goal === item && styles.setupChoiceActive]}><Text style={styles.rowTitle}>{item}</Text></Pressable>)}
      <Text style={[styles.eyebrow, {
        marginTop: 18
      }]}>CHESS.COM CONNECTION</Text>
        <Text style={styles.bodyMuted}>{username ? `Connected as ${username}. Only public game data is read.` : 'No account connected.'}</Text>
      {username ? <Button title="Disconnect account" secondary onPress={onDisconnect} /> : <Button title="Connect on Home" secondary onPress={() => onTab('home')} />}
      <Button title="Review your privacy & app setup" secondary onPress={() => onTab('setup')} />
      <Button title="Change my starting preferences" secondary onPress={onRestart} />
    </View>
    <View style={styles.noticeCard}><Text style={styles.noticeIcon}>⌂</Text>
        <View style={{
        flex: 1
      }}><Text style={styles.noticeTitle}>Saved on this device</Text>
        <Text style={styles.noticeCopy}>Profile preferences, recent imported games, match history, and coach adjustment stay in local app storage.</Text></View></View>
  </ScrollView>;
}
