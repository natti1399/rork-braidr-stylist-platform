// Stylist calendar screen - namespaced for future multi-user support
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

export default function StylistCalendarScreen() {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, idx) => ({
    day: daysInPrevMonth - firstDayOfMonth + idx + 1,
    month: prevMonth,
    year: prevMonthYear,
    isCurrentMonth: false,
  }));
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, idx) => ({
    day: idx + 1,
    month: currentMonth,
    year: currentYear,
    isCurrentMonth: true,
  }));
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const totalDaysShown = 42;
  const remaining = totalDaysShown - prevMonthDays.length - currentMonthDays.length;
  const nextMonthDays = Array.from({ length: remaining }, (_, idx) => ({
    day: idx + 1,
    month: nextMonth,
    year: nextMonthYear,
    isCurrentMonth: false,
  }));
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const goPrev = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goNext = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const refresh = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const isSelected = (d: any) =>
    selectedDate.getDate() === d.day &&
    selectedDate.getMonth() === d.month &&
    selectedDate.getFullYear() === d.year;

  const formatMonthYear = (d: Date) => `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  const formatSelected = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerLeft}>
          <View style={styles.profileInitialCircle}><Text style={styles.profileInitial}>T</Text></View>
          <Text style={styles.monthYearText}>{formatMonthYear(currentDate)}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={refresh}><Ionicons name="refresh" size={22} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}><Ionicons name="add" size={22} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={goPrev}><Ionicons name="chevron-back" size={22} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={goNext}><Ionicons name="chevron-forward" size={22} color="#333" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <View style={styles.daysOfWeekHeader}>
            {DAYS_OF_WEEK.map((d) => (<Text key={d} style={styles.dayOfWeekText}>{d}</Text>))}
          </View>
          <View style={styles.calendarGrid}>
            {allDays.map((day, idx) => (
              <TouchableOpacity key={idx} style={[styles.dayCell, isSelected(day) && styles.selectedDayCell, !day.isCurrentMonth && styles.otherMonthDayCell]} onPress={() => setSelectedDate(new Date(day.year, day.month, day.day))}>
                <Text style={[styles.dayText, isSelected(day) && styles.selectedDayText, !day.isCurrentMonth && styles.otherMonthDayText]}>{day.day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.selectedDayContainer}>
          <Text style={styles.selectedDayTitle}>{formatSelected(selectedDate)}</Text>
          <View style={styles.noAppointmentsContainer}>
            <Text style={styles.noAppointmentsText}>No appointments for this day.</Text>
            <TouchableOpacity style={styles.addBookingButton}><Text style={styles.addBookingButtonText}>+ Add Booking</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#f8f9fa' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profileInitialCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4267FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  profileInitial: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  monthYearText: { fontSize: 20, fontWeight: '700', color: '#222' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 8, marginLeft: 4 },
  scrollView: { flex: 1 },
  scrollViewContent: { paddingHorizontal: 20, paddingBottom: 30 },
  calendarContainer: { backgroundColor: '#f8f9fa', borderRadius: 16, marginBottom: 20 },
  daysOfWeekHeader: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  dayOfWeekText: { fontSize: 14, fontWeight: '500', color: '#8E8E93', width: '14.28%', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  selectedDayCell: { backgroundColor: '#4267FF', borderRadius: 20 },
  otherMonthDayCell: { opacity: 0.5 },
  dayText: { fontSize: 16, fontWeight: '500', color: '#222' },
  selectedDayText: { color: 'white', fontWeight: '600' },
  otherMonthDayText: { color: '#8E8E93' },
  selectedDayContainer: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  selectedDayTitle: { fontSize: 18, fontWeight: '600', color: '#222', marginBottom: 20 },
  noAppointmentsContainer: { alignItems: 'center' },
  noAppointmentsText: { fontSize: 16, color: '#8E8E93', marginBottom: 20 },
  addBookingButton: { backgroundColor: '#4267FF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  addBookingButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});