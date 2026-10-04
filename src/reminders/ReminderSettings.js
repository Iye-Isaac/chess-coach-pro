import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Button } from '../components';
import { C, S, R, F, W, T, M } from '../theme';
import styles from './ReminderSettings.styles';
import { enableReminders, getReminderSettings, reminderAvailable, reminderEligible, subscribeReminderSettings, updateReminderSettings } from './service';

const pad = number => String(number).padStart(2, '0');

function TimeColumn({ label, value, count, onSelect }) {
  return <View style={styles.column}>
    <Text style={styles.inputLabel}>{label}</Text>
    <ScrollView style={styles.timeList} contentOffset={{ x: 0, y: value * 44 }}>
      {Array.from({ length: count }, (_, number) => <Pressable key={number}
        accessibilityRole="radio" accessibilityLabel={`${label} ${pad(number)}`}
        accessibilityState={{ checked: value === number }} onPress={() => onSelect(number)}
        style={[styles.timeOption, number === value && styles.selectedOption]}>
        <Text style={[styles.timeNumber, number === value && styles.selectedNumber]}>{pad(number)}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}

export function ReminderSettings() {
  const [settings, setSettings] = useState({ enabled: false, hour: 18, minute: 0 });
  const [eligible, setEligible] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([getReminderSettings(), reminderEligible()]).then(([saved, canEnable]) => {
      if (active) { setSettings(saved); setEligible(canEnable); setReady(true); }
    });
    const unsubscribe = subscribeReminderSettings(next => { if (active) setSettings(next); });
    return () => { active = false; unsubscribe(); };
  }, []);
  const save = async changes => {
    setBusy(true); setError('');
    try { setSettings(await updateReminderSettings(changes)); }
    catch (err) { setError(err.message || 'Could not update reminders.'); }
    finally { setBusy(false); }
  };
  const enable = async () => {
    setBusy(true); setError('');
    try { setSettings(await enableReminders()); }
    catch (err) { setError(err.message || 'Could not enable reminders.'); }
    finally { setBusy(false); }
  };
  const toggle = enabled => {
    if (!enabled) { save({ enabled: false }); return; }
    Alert.alert('Make time for your daily plan', `Allow a gentle reminder at ${pad(settings.hour)}:${pad(settings.minute)} when your practice is still waiting?`, [
      { text: 'Not now', style: 'cancel' }, { text: 'Allow reminders', onPress: enable },
    ]);
  };
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>Daily practice</Text>
    <Text style={styles.cardTitle}>Reminders</Text>
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}><Text style={styles.rowTitle}>A gentle daily reminder</Text>
        <Text style={styles.settingCopy}>Only when your daily plan is still waiting.</Text></View>
      <Switch accessibilityRole="switch" accessibilityLabel="Daily practice reminders" value={settings.enabled}
        disabled={!ready || busy || (!settings.enabled && (!eligible || !reminderAvailable))}
        onValueChange={toggle} trackColor={{ false: C.line, true: C.greenSoft }} thumbColor={settings.enabled ? C.green : C.faint} />
    </View>
    {!eligible && <Text style={styles.cardCopy}>Complete your first daily plan item to unlock reminders.</Text>}
    {!reminderAvailable && <Text style={styles.cardCopy}>Install the latest native app build to enable notifications.</Text>}
    <Button title={`Reminder time · ${pad(settings.hour)}:${pad(settings.minute)}`} secondary disabled={!ready || busy}
      onPress={() => { setHour(settings.hour); setMinute(settings.minute); setPickerOpen(true); }} />
    {!!error && <Text style={styles.errorText}>{error}</Text>}
    <Modal visible={pickerOpen} transparent animationType="none" onRequestClose={() => setPickerOpen(false)}>
      <View style={styles.overlay}><View style={styles.picker} accessibilityViewIsModal>
        <Text style={styles.cardTitle}>Choose your practice time</Text>
        <Text style={styles.cardCopy}>Your phone’s local time.</Text>
        <View style={styles.timeColumns}>
          <TimeColumn label="Hour" value={hour} count={24} onSelect={setHour} />
          <Text style={styles.colon}>:</Text>
          <TimeColumn label="Minute" value={minute} count={60} onSelect={setMinute} />
        </View>
        <Button title={`Use ${pad(hour)}:${pad(minute)}`} onPress={() => { setPickerOpen(false); save({ hour, minute }); }} />
        <Button title="Cancel" secondary onPress={() => setPickerOpen(false)} />
      </View></View>
    </Modal>
  </View>;
}
