import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Sample appointments data
  const todaysAppointments = [
    {
      id: '1',
      time: '10:00 AM',
      customer: 'Sarah Johnson',
      service: 'Box Braids',
      price: 180,
      confirmed: true
    },
    {
      id: '2',
      time: '2:30 PM',
      customer: 'Michelle Lee',
      service: 'Knotless Braids',
      price: 220,
      confirmed: false
    },
    {
      id: '3',
      time: '5:00 PM',
      customer: 'Tasha Williams',
      service: 'Goddess Braids',
      price: 150,
      confirmed: true
    }
  ];
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.profileGreeting}>
          <View style={styles.profileInitialCircle}>
            <Text style={styles.profileInitial}>T</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Good afternoon, Stylist! 👋</Text>
            <Text style={styles.appointmentsSummary}>You have {todaysAppointments.length} appointments today.</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Next Appointment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.nextAppointmentTitle}>Next Appointment</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.appointmentTimeContainer}>
            <Ionicons name="time-outline" size={16} color="#4267FF" style={styles.timeIcon} />
            <Text style={styles.nextAppointmentTime}>Today at 10:00 AM</Text>
          </View>
          
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentDetailsRow}>
              <Text style={styles.appointmentService}>Box Braids for Sarah Johnson</Text>
              <View style={styles.blueDot} />
            </View>
            <View style={styles.appointmentInfoRow}>
              <View style={styles.durationContainer}>
                <Ionicons name="time" size={14} color="#666" style={styles.durationIcon} />
                <Text style={styles.appointmentDuration}>4h</Text>
              </View>
              <Text style={styles.appointmentPrice}>$180</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="calendar-outline" size={22} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Manage Availability</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle-outline" size={22} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Create New Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={22} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Customer Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="cash-outline" size={22} color="white" />
            </View>
            <Text style={styles.actionButtonText}>View Earnings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Today's Appointments Section */}
        <View style={styles.todaysAppointmentsContainer}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          
          {todaysAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentListItem}>
              <View style={styles.appointmentTimeColumn}>
                <Text style={styles.appointmentListTime}>{appointment.time}</Text>
              </View>
              
              <View style={styles.appointmentDetailsColumn}>
                <Text style={styles.appointmentListCustomer}>{appointment.customer}</Text>
                <Text style={styles.appointmentListService}>{appointment.service}</Text>
              </View>
              
              <View style={styles.appointmentPriceColumn}>
                <Text style={styles.appointmentListPrice}>${appointment.price}</Text>
                {appointment.confirmed ? (
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addAppointmentButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
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
  profileGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  profileInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  appointmentsSummary: {
    fontSize: 14,
    color: '#666',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    marginRight: 16,
    padding: 4,
  },
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
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextAppointmentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4267FF',
  },
  appointmentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeIcon: {
    marginRight: 4,
  },
  nextAppointmentTime: {
    fontSize: 14,
    color: '#4267FF',
    fontWeight: '500',
  },
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#4267FF',
  },
  appointmentDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4267FF',
    marginLeft: 8,
  },
  appointmentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIcon: {
    marginRight: 4,
  },
  appointmentDuration: {
    fontSize: 14,
    color: '#666',
  },
  appointmentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
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
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  // Today's Appointments styles
  todaysAppointmentsContainer: {
    position: 'relative',
    marginBottom: 20,
  },
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
  appointmentTimeColumn: {
    width: 80,
    marginRight: 12,
  },
  appointmentListTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4267FF',
  },
  appointmentDetailsColumn: {
    flex: 1,
  },
  appointmentListCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  appointmentListService: {
    fontSize: 14,
    color: '#666',
  },
  appointmentPriceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
  },
  appointmentListPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 4,
  },
  confirmedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confirmedBadgeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4267FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
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
});