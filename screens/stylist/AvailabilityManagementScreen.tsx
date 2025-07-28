import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  isAvailable: boolean;
}

interface DaySchedule {
  day: string;
  dayNumber: number;
  isWorkingDay: boolean;
  timeSlots: TimeSlot[];
}

interface AvailabilityManagementScreenProps {
  navigation?: any;
}

// Generate initial schedule data
const generateInitialSchedule = (): DaySchedule[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { start: '09:00', end: '11:00' },
    { start: '11:00', end: '13:00' },
    { start: '13:00', end: '15:00' },
    { start: '15:00', end: '17:00' },
    { start: '17:00', end: '19:00' }
  ];

  return days.map((day, dayNumber) => ({
    day,
    dayNumber,
    isWorkingDay: dayNumber !== 6, // Sunday is off by default
    timeSlots: timeSlots.map((slot, index) => ({
      id: `${dayNumber}-${index}`,
      start: slot.start,
      end: slot.end,
      isAvailable: dayNumber !== 6 && Math.random() > 0.3 // 70% availability for working days
    }))
  }));
};

export default function AvailabilityManagementScreen({ navigation }: AvailabilityManagementScreenProps) {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState<DaySchedule[]>(generateInitialSchedule());
  const [selectedDay, setSelectedDay] = useState(0);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const getAvailabilityStats = () => {
    const totalSlots = schedule.reduce((total, day) => total + (day.isWorkingDay ? day.timeSlots.length : 0), 0);
    const availableSlots = schedule.reduce((total, day) => 
      total + (day.isWorkingDay ? day.timeSlots.filter(slot => slot.isAvailable).length : 0), 0
    );
    const workingDays = schedule.filter(day => day.isWorkingDay).length;
    
    return { totalSlots, availableSlots, workingDays };
  };

  const toggleWorkingDay = (dayIndex: number) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            isWorkingDay: !day.isWorkingDay,
            timeSlots: day.timeSlots.map(slot => ({ ...slot, isAvailable: !day.isWorkingDay }))
          }
        : day
    ));
  };

  const toggleTimeSlot = (dayIndex: number, slotId: string) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? {
            ...day,
            timeSlots: day.timeSlots.map(slot => 
              slot.id === slotId 
                ? { ...slot, isAvailable: !slot.isAvailable }
                : slot
            )
          }
        : day
    ));
  };

  const setAllSlotsAvailable = (dayIndex: number, available: boolean) => {
    setSchedule(prev => prev.map((day, index) => 
      index === dayIndex 
        ? {
            ...day,
            timeSlots: day.timeSlots.map(slot => ({ ...slot, isAvailable: available }))
          }
        : day
    ));
  };

  const copySchedule = (fromDay: number, toDay: number) => {
    setSchedule(prev => prev.map((day, index) => 
      index === toDay 
        ? {
            ...day,
            isWorkingDay: prev[fromDay].isWorkingDay,
            timeSlots: prev[fromDay].timeSlots.map(slot => ({
              ...slot,
              id: `${toDay}-${slot.id.split('-')[1]}`
            }))
          }
        : day
    ));
  };

  const showBulkActionsMenu = () => {
    Alert.alert(
      'Bulk Actions',
      'Choose an action to apply to your schedule',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set All Available', 
          onPress: () => {
            setSchedule(prev => prev.map(day => ({
              ...day,
              isWorkingDay: day.dayNumber !== 6,
              timeSlots: day.timeSlots.map(slot => ({ ...slot, isAvailable: day.dayNumber !== 6 }))
            })));
          }
        },
        { 
          text: 'Set All Unavailable', 
          onPress: () => {
            setSchedule(prev => prev.map(day => ({
              ...day,
              timeSlots: day.timeSlots.map(slot => ({ ...slot, isAvailable: false }))
            })));
          }
        }
      ]
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderDayTab = (day: DaySchedule, index: number) => {
    const availableSlots = day.timeSlots.filter(slot => slot.isAvailable).length;
    const totalSlots = day.timeSlots.length;
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dayTab, selectedDay === index && styles.selectedDayTab]}
        onPress={() => setSelectedDay(index)}
      >
        <Text style={[styles.dayTabText, selectedDay === index && styles.selectedDayTabText]}>
          {day.day.slice(0, 3)}
        </Text>
        <View style={[styles.availabilityDot, day.isWorkingDay ? styles.workingDot : styles.offDot]} />
        {day.isWorkingDay && (
          <Text style={[styles.slotCount, selectedDay === index && styles.selectedSlotCount]}>
            {availableSlots}/{totalSlots}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (slot: TimeSlot, dayIndex: number) => {
    const currentDay = schedule[dayIndex];
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.timeSlotCard,
          slot.isAvailable ? styles.availableSlotCard : styles.unavailableSlotCard,
          !currentDay.isWorkingDay && styles.disabledSlotCard
        ]}
        onPress={() => currentDay.isWorkingDay && toggleTimeSlot(dayIndex, slot.id)}
        disabled={!currentDay.isWorkingDay}
      >
        <View style={styles.timeSlotHeader}>
          <Text style={[
            styles.timeSlotTime,
            slot.isAvailable ? styles.availableSlotTime : styles.unavailableSlotTime,
            !currentDay.isWorkingDay && styles.disabledSlotTime
          ]}>
            {formatTime(slot.start)} - {formatTime(slot.end)}
          </Text>
          <View style={[
            styles.availabilityIndicator,
            slot.isAvailable ? styles.availableIndicator : styles.unavailableIndicator,
            !currentDay.isWorkingDay && styles.disabledIndicator
          ]}>
            <Ionicons 
              name={slot.isAvailable ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={
                !currentDay.isWorkingDay ? "#8E8E93" :
                slot.isAvailable ? "#34C759" : "#FF3B30"
              } 
            />
          </View>
        </View>
        <Text style={[
          styles.timeSlotStatus,
          slot.isAvailable ? styles.availableSlotStatus : styles.unavailableSlotStatus,
          !currentDay.isWorkingDay && styles.disabledSlotStatus
        ]}>
          {!currentDay.isWorkingDay ? 'Day Off' : 
           slot.isAvailable ? 'Available for booking' : 'Not available'}
        </Text>
      </TouchableOpacity>
    );
  };

  const stats = getAvailabilityStats();
  const currentDay = schedule[selectedDay];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4267FF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Availability</Text>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={showBulkActionsMenu}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.workingDays}</Text>
          <Text style={styles.statLabel}>Working Days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.availableSlots}</Text>
          <Text style={styles.statLabel}>Available Slots</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.round((stats.availableSlots / stats.totalSlots) * 100)}%</Text>
          <Text style={styles.statLabel}>Availability</Text>
        </View>
      </View>

      {/* Day Tabs */}
      <View style={styles.dayTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsScroll}>
          {schedule.map(renderDayTab)}
        </ScrollView>
      </View>

      {/* Day Controls */}
      <View style={styles.dayControls}>
        <View style={styles.dayControlHeader}>
          <Text style={styles.dayControlTitle}>{currentDay.day}</Text>
          <View style={styles.workingDayToggle}>
            <Text style={styles.workingDayLabel}>Working Day</Text>
            <Switch
              value={currentDay.isWorkingDay}
              onValueChange={() => toggleWorkingDay(selectedDay)}
              trackColor={{ false: '#E5E5EA', true: '#4267FF' }}
              thumbColor="white"
            />
          </View>
        </View>

        {currentDay.isWorkingDay && (
          <View style={styles.dayActions}>
            <TouchableOpacity 
              style={styles.dayActionButton}
              onPress={() => setAllSlotsAvailable(selectedDay, true)}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#34C759" />
              <Text style={[styles.dayActionText, { color: '#34C759' }]}>All Available</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dayActionButton}
              onPress={() => setAllSlotsAvailable(selectedDay, false)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FF3B30" />
              <Text style={[styles.dayActionText, { color: '#FF3B30' }]}>All Unavailable</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Time Slots */}
      <ScrollView style={styles.timeSlotsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.timeSlotsContent}>
          {currentDay.timeSlots.map(slot => renderTimeSlot(slot, selectedDay))}
        </View>
        
        {!currentDay.isWorkingDay && (
          <View style={styles.dayOffMessage}>
            <View style={styles.dayOffIcon}>
              <Ionicons name="bed-outline" size={48} color="#8E8E93" />
            </View>
            <Text style={styles.dayOffTitle}>Day Off</Text>
            <Text style={styles.dayOffDescription}>
              You're not working on {currentDay.day}. Toggle the working day switch above to start accepting bookings.
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Changes Button */}
      <View style={[styles.saveContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4267FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dayTabs: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 16,
  },
  dayTabsScroll: {
    paddingHorizontal: 20,
  },
  dayTab: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    minWidth: 70,
  },
  selectedDayTab: {
    backgroundColor: '#4267FF',
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  selectedDayTabText: {
    color: 'white',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  workingDot: {
    backgroundColor: '#34C759',
  },
  offDot: {
    backgroundColor: '#FF3B30',
  },
  slotCount: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  selectedSlotCount: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dayControls: {
    backgroundColor: 'white',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayControlTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  workingDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workingDayLabel: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  dayActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  dayActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  dayActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlotsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  timeSlotCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  availableSlotCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  unavailableSlotCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  disabledSlotCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8E8E93',
    opacity: 0.6,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  availableSlotTime: {
    color: '#222',
  },
  unavailableSlotTime: {
    color: '#666',
  },
  disabledSlotTime: {
    color: '#8E8E93',
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableIndicator: {},
  unavailableIndicator: {},
  disabledIndicator: {},
  timeSlotStatus: {
    fontSize: 14,
  },
  availableSlotStatus: {
    color: '#34C759',
  },
  unavailableSlotStatus: {
    color: '#FF3B30',
  },
  disabledSlotStatus: {
    color: '#8E8E93',
  },
  dayOffMessage: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  dayOffIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayOffTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  dayOffDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 100,
  },
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#4267FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});