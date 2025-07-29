import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, type Appointment } from '../../src/services/bookingService';

export default function StylistHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    pendingCount: 0
  });

  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [])
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      if (response.success && response.data) {
        const today = new Date().toDateString();
        const todayAppts = response.data.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        );
        setTodaysAppointments(todayAppts);
        
        // Calculate stats
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekAppts = response.data.filter(apt => 
          new Date(apt.appointmentDate) >= weekStart
        );
        const pendingAppts = response.data.filter(apt => apt.status === 'pending');
        
        setStats({
          todayCount: todayAppts.length,
          weekCount: weekAppts.length,
          pendingCount: pendingAppts.length
        });
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      Alert.alert('Error', 'Failed to load your appointments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.profileGreeting}>
          <View style={styles.profileInitialCircle}>
            <Text style={styles.profileInitial}>
              {user?.firstName?.charAt(0)?.toUpperCase() || 'S'}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName || 'Stylist'}! 👋
            </Text>
            <Text style={styles.appointmentsSummary}>
              {loading ? 'Loading...' : `You have ${stats.todayCount} appointments today.`}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('NotificationCenter')}
          >
            <Ionicons name="notifications-outline" size={22} color="#333" />
            {stats.pendingCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{stats.pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Next Appointment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.nextAppointmentTitle}>Next Appointment</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4267FF" />
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          ) : todaysAppointments.length > 0 ? (
            (() => {
              const nextAppointment = todaysAppointments
                .filter(apt => new Date(`${apt.appointmentDate} ${apt.startTime}`) > new Date())
                .sort((a, b) => new Date(`${a.appointmentDate} ${a.startTime}`).getTime() - new Date(`${b.appointmentDate} ${b.startTime}`).getTime())[0];
              
              return nextAppointment ? (
                <>
                  <View style={styles.appointmentTimeContainer}>
                    <Ionicons name="time-outline" size={16} color="#4267FF" style={styles.timeIcon} />
                    <Text style={styles.nextAppointmentTime}>
                      Today at {nextAppointment.startTime}
                    </Text>
                  </View>

                  <View style={styles.appointmentCard}>
                    <View style={styles.appointmentDetailsRow}>
                      <Text style={styles.appointmentService}>
                        {nextAppointment.serviceId} - Customer #{nextAppointment.customerId.slice(-4)}
                      </Text>
                      <View style={[styles.blueDot, { 
                        backgroundColor: nextAppointment.status === 'confirmed' ? '#4267FF' : 
                                        nextAppointment.status === 'pending' ? '#F59E0B' : '#6B7280' 
                      }]} />
                    </View>
                    <View style={styles.appointmentInfoRow}>
                      <View style={styles.durationContainer}>
                        <Ionicons name="time" size={14} color="#666" style={styles.durationIcon} />
                        <Text style={styles.appointmentDuration}>{Math.round(nextAppointment.duration / 60)}h</Text>
                      </View>
                      <Text style={styles.appointmentStatus}>
                        {nextAppointment.status.charAt(0).toUpperCase() + nextAppointment.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noAppointmentContainer}>
                  <Text style={styles.noAppointmentText}>No more appointments today</Text>
                </View>
              );
            })()
          ) : (
            <View style={styles.noAppointmentContainer}>
              <Text style={styles.noAppointmentText}>No appointments scheduled for today</Text>
            </View>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { icon: 'calendar-outline', label: 'Manage Availability', screen: 'AvailabilityManagement' },
            { icon: 'add-circle-outline', label: 'Manage Services', screen: 'ServiceManagement' },
            { icon: 'chatbox-ellipses-outline', label: 'Messages', screen: 'Messages' },
            { icon: 'settings-outline', label: 'Settings', screen: 'StylistSettings' },
          ].map((btn) => (
            <TouchableOpacity 
              key={btn.label} 
              style={styles.actionButton}
              onPress={() => navigation.navigate(btn.screen)}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name={btn.icon as any} size={22} color="white" />
              </View>
              <Text style={styles.actionButtonText}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TODAY'S APPOINTMENTS */}
        <View style={styles.todaysAppointmentsContainer}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4267FF" />
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          ) : todaysAppointments.length > 0 ? (
            todaysAppointments.map((appt) => (
              <View key={appt.id} style={styles.appointmentListItem}>
                <View style={styles.appointmentTimeColumn}>
                  <Text style={styles.appointmentListTime}>{appt.startTime}</Text>
                </View>

                <View style={styles.appointmentDetailsColumn}>
                  <Text style={styles.appointmentListCustomer}>Customer #{appt.customerId.slice(-4)}</Text>
                  <Text style={styles.appointmentListService}>Service ID: {appt.serviceId}</Text>
                </View>

                <View style={styles.appointmentPriceColumn}>
                  <Text style={styles.appointmentListPrice}>${appt.totalPrice}</Text>
                  {appt.status === 'confirmed' ? (
                    <View style={styles.confirmedBadge}>
                      <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                    </View>
                  ) : appt.status === 'pending' ? (
                    <TouchableOpacity 
                      style={styles.confirmButton}
                      onPress={() => bookingService.updateBookingStatus(appt.id, 'confirmed')}
                    >
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.appointmentStatus, { 
                      backgroundColor: appt.status === 'completed' ? '#34C759' : 
                                     appt.status === 'cancelled' ? '#FF3B30' : '#F59E0B' 
                    }]}>
                      <Text style={styles.appointmentStatusText}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noAppointmentContainer}>
              <Text style={styles.noAppointmentText}>No appointments scheduled for today</Text>
            </View>
          )}

          <TouchableOpacity style={styles.addAppointmentButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// All styles are copied verbatim from the original HomeScreen to keep visual parity
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    zIndex: 10,
  },
  profileGreeting: { flexDirection: 'row', alignItems: 'center' },
  profileInitialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  greeting: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 2 },
  appointmentsSummary: { fontSize: 14, color: '#666' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { position: 'relative', marginRight: 16, padding: 4 },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  notificationBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  scrollViewContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nextAppointmentTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#4267FF' },
  appointmentTimeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeIcon: { marginRight: 4 },
  nextAppointmentTime: { fontSize: 14, color: '#4267FF', fontWeight: '500' },
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#4267FF',
  },
  appointmentDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  appointmentService: { fontSize: 16, fontWeight: '600', color: '#222', flex: 1 },
  blueDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4267FF', marginLeft: 8 },
  appointmentInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationContainer: { flexDirection: 'row', alignItems: 'center' },
  durationIcon: { marginRight: 4 },
  appointmentDuration: { fontSize: 14, color: '#666' },
  appointmentPrice: { fontSize: 16, fontWeight: '600', color: '#34C759' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 16 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 24 },
  actionButton: {
    backgroundColor: '#4267FF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    marginBottom: 16,
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: { color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 13 },
  todaysAppointmentsContainer: { position: 'relative', marginBottom: 20 },
  appointmentListItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  appointmentTimeColumn: { width: 80, marginRight: 12 },
  appointmentListTime: { fontSize: 15, fontWeight: '600', color: '#4267FF' },
  appointmentDetailsColumn: { flex: 1 },
  appointmentListCustomer: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 4 },
  appointmentListService: { fontSize: 14, color: '#666' },
  appointmentPriceColumn: { alignItems: 'flex-end', justifyContent: 'space-between', height: 50 },
  appointmentListPrice: { fontSize: 16, fontWeight: '600', color: '#34C759', marginBottom: 4 },
  confirmedBadge: { backgroundColor: 'rgba(52, 199, 89, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  confirmedBadgeText: { color: '#34C759', fontSize: 12, fontWeight: '600' },
  confirmButton: { backgroundColor: '#4267FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  confirmButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  addAppointmentButton: {
    position: 'absolute',
    bottom: -20,
    right: 0,
    backgroundColor: '#4267FF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noAppointmentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAppointmentText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appointmentStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});