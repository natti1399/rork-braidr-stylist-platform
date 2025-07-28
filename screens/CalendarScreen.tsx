import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Days of the week header
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Function to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Function to get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  
  // State for current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get days in current month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  
  // Get first day of current month
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Get days from previous month to fill the first week
  const daysFromPrevMonth = firstDayOfMonth;
  
  // Get days in previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
  
  // Calculate days to show from previous month
  const prevMonthDays = [];
  for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
    prevMonthDays.push({
      day: i,
      month: prevMonth,
      year: prevMonthYear,
      isCurrentMonth: false
    });
  }
  
  // Calculate days to show from current month
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true
    });
  }
  
  // Calculate days to show from next month
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthDays = [];
  const totalDaysShown = 42; // 6 rows of 7 days
  const remainingDays = totalDaysShown - prevMonthDays.length - currentMonthDays.length;
  
  for (let i = 1; i <= remainingDays; i++) {
    nextMonthDays.push({
      day: i,
      month: nextMonth,
      year: nextMonthYear,
      isCurrentMonth: false
    });
  }
  
  // Combine all days
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  
  // Function to navigate to previous month
  const goToPrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(newDate);
  };
  
  // Function to navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
  };
  
  // Function to refresh the calendar
  const refreshCalendar = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  // Function to add a new booking
  const addBooking = () => {
    // Implement booking functionality
    console.log('Add booking for', selectedDate.toDateString());
  };
  
  // Function to check if a date is selected
  const isDateSelected = (day: number, month: number, year: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };
  
  // Function to format month name and year
  const formatMonthYear = (date: Date) => {
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  };
  
  // Function to format day for display
  const formatSelectedDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Check if the selected date has appointments
  const hasAppointments = false; // This would be determined by your data
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerLeft}>
          <View style={styles.profileInitialCircle}>
            <Text style={styles.profileInitial}>T</Text>
          </View>
          <Text style={styles.monthYearText}>{formatMonthYear(currentDate)}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={refreshCalendar}>
            <Ionicons name="refresh" size={22} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={22} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={goToPrevMonth}>
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Days of week header */}
          <View style={styles.daysOfWeekHeader}>
            {DAYS_OF_WEEK.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>
                {day}
              </Text>
            ))}
          </View>
          
          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {allDays.map((dayInfo, index) => {
              const isSelected = isDateSelected(dayInfo.day, dayInfo.month, dayInfo.year);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    !dayInfo.isCurrentMonth && styles.otherMonthDayCell
                  ]}
                  onPress={() => setSelectedDate(new Date(dayInfo.year, dayInfo.month, dayInfo.day))}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      !dayInfo.isCurrentMonth && styles.otherMonthDayText
                    ]}
                  >
                    {dayInfo.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        {/* Selected day details */}
        <View style={styles.selectedDayContainer}>
          <Text style={styles.selectedDayTitle}>{formatSelectedDay(selectedDate)}</Text>
          
          {hasAppointments ? (
            <View style={styles.appointmentsContainer}>
              {/* Appointments would be listed here */}
              <Text>Appointments would be shown here</Text>
            </View>
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Text style={styles.noAppointmentsText}>No appointments for this day.</Text>
              <TouchableOpacity style={styles.addBookingButton} onPress={addBooking}>
                <Text style={styles.addBookingButtonText}>+ Add Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInitialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  calendarContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  daysOfWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  dayOfWeekText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  selectedDayCell: {
    backgroundColor: '#4267FF',
    borderRadius: 20,
  },
  otherMonthDayCell: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  otherMonthDayText: {
    color: '#8E8E93',
  },
  selectedDayContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 20,
  },
  appointmentsContainer: {
    minHeight: 100,
  },
  noAppointmentsContainer: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  addBookingButton: {
    backgroundColor: '#4267FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  addBookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});