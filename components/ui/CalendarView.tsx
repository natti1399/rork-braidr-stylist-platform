import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  markedDates?: Date[]; // Dates with appointments
}

export const CalendarView = ({
  selectedDate,
  onDateSelect,
  markedDates = [],
}: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if a date has appointments
  const hasAppointments = (date: Date) => {
    return markedDates.some(
      (markedDate) =>
        markedDate.getDate() === date.getDate() &&
        markedDate.getMonth() === date.getMonth() &&
        markedDate.getFullYear() === date.getFullYear()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Render calendar grid
  const renderCalendarGrid = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Render weekday headers
    const weekdayHeaders = weekdays.map((day, index) => (
      <Text key={`header-${index}`} style={styles.weekdayHeader}>
        {day}
      </Text>
    ));
    days.push(
      <View key="weekdays" style={styles.weekdayRow}>
        {weekdayHeaders}
      </View>
    );
    
    // Calculate previous month's days to show
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    let dayCounter = 1;
    let nextMonthCounter = 1;
    
    // Create weeks
    for (let i = 0; i < 6; i++) {
      const week = [];
      
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          // Previous month days
          const prevMonthDay = daysInPrevMonth - (firstDayOfMonth - j - 1);
          const date = new Date(prevMonthYear, prevMonth, prevMonthDay);
          
          week.push(
            <TouchableOpacity
              key={`prev-${j}`}
              style={styles.dayButton}
              onPress={() => onDateSelect(date)}
            >
              <Text style={styles.prevMonthDay}>{prevMonthDay}</Text>
            </TouchableOpacity>
          );
        } else if (dayCounter > daysInMonth) {
          // Next month days
          const date = new Date(
            month === 11 ? year + 1 : year,
            month === 11 ? 0 : month + 1,
            nextMonthCounter
          );
          
          week.push(
            <TouchableOpacity
              key={`next-${nextMonthCounter}`}
              style={styles.dayButton}
              onPress={() => onDateSelect(date)}
            >
              <Text style={styles.nextMonthDay}>{nextMonthCounter}</Text>
            </TouchableOpacity>
          );
          
          nextMonthCounter++;
        } else {
          // Current month days
          const date = new Date(year, month, dayCounter);
          const isSelectedDay = isSelected(date);
          const isTodayDate = isToday(date);
          const hasAppointmentsForDay = hasAppointments(date);
          
          week.push(
            <TouchableOpacity
              key={dayCounter}
              style={[
                styles.dayButton,
                isSelectedDay && styles.selectedDay,
                isTodayDate && styles.today,
              ]}
              onPress={() => onDateSelect(date)}
            >
              <Text
                style={[
                  styles.currentMonthDay,
                  isSelectedDay && styles.selectedDayText,
                  isTodayDate && styles.todayText,
                ]}
              >
                {dayCounter}
              </Text>
              {hasAppointmentsForDay && <View style={styles.appointmentDot} />}
            </TouchableOpacity>
          );
          
          dayCounter++;
        }
      }
      
      days.push(
        <View key={`week-${i}`} style={styles.weekRow}>
          {week}
        </View>
      );
      
      // Stop rendering if we've shown all days
      if (dayCounter > daysInMonth && i >= 3) {
        break;
      }
    }
    
    return days;
  }, [currentMonth, selectedDate, markedDates, hasAppointments, isSelected, onDateSelect]);

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navigationButton}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navigationButton}>{">"}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarGrid}>{renderCalendarGrid()}</View>
      
      <View style={styles.selectedDateInfo}>
        <Text style={styles.selectedDateText}>
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navigationButton: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.primary,
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  calendarGrid: {},
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayHeader: {
    width: 40,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  prevMonthDay: {
    color: Colors.text.secondary,
    opacity: 0.5,
  },
  currentMonthDay: {
    color: Colors.text.primary,
  },
  nextMonthDay: {
    color: Colors.text.secondary,
    opacity: 0.5,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
  },
  selectedDayText: {
    color: Colors.text.light,
    fontWeight: "600",
  },
  today: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  todayText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  appointmentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: "absolute",
    bottom: 6,
  },
  selectedDateInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});