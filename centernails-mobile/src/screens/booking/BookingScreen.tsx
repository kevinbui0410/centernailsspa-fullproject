import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { bookingService, paymentService } from '../../services/api';

const BookingScreen = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const { createPaymentMethod } = useStripe();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await bookingService.getServices();
      setServices(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load services. Please try again.');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleBooking = async () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    try {
      setLoading(true);

      // Create payment intent
      const { clientSecret } = await paymentService.createPaymentIntent(
        selectedService.price
      );

      // Create payment method
      const { paymentMethod, error } = await createPaymentMethod({
        type: 'card',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Confirm payment
      await paymentService.confirmPayment(paymentMethod.id);

      // Create appointment
      const appointmentData = {
        serviceId: selectedService.id,
        date: selectedDate,
        paymentMethodId: paymentMethod.id,
      };

      await bookingService.createAppointment(appointmentData);

      Alert.alert(
        'Success',
        'Your appointment has been booked successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedService(null);
              setSelectedDate(new Date());
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingServices) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Your Service</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService?.id === service.id && styles.selectedService,
              ]}
              onPress={() => handleServiceSelect(service)}
              disabled={loading}
            >
              <Ionicons
                name="sparkles"
                size={24}
                color={selectedService?.id === service.id ? colors.background.default : colors.primary.main}
              />
              <Text
                style={[
                  styles.serviceName,
                  selectedService?.id === service.id && styles.selectedServiceText,
                ]}
              >
                {service.name}
              </Text>
              <Text
                style={[
                  styles.servicePrice,
                  selectedService?.id === service.id && styles.selectedServiceText,
                ]}
              >
                ${service.price}
              </Text>
              <Text
                style={[
                  styles.serviceDuration,
                  selectedService?.id === service.id && styles.selectedServiceText,
                ]}
              >
                {service.duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date & Time</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
          disabled={loading}
        >
          <Ionicons name="calendar" size={24} color={colors.primary.main} />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString()} at{' '}
            {selectedDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <CardField
          postalCodeEnabled={false}
          placeholder={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={{
            backgroundColor: colors.background.default,
            textColor: colors.text.primary,
          }}
          style={styles.cardField}
        />
      </View>

      <TouchableOpacity 
        style={[styles.bookButton, loading && styles.bookButtonDisabled]} 
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background.default} />
        ) : (
          <Text style={styles.bookButtonText}>Book Now</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 150,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  selectedService: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
  },
  servicePrice: {
    fontSize: 14,
    color: colors.primary.main,
    marginTop: 5,
  },
  serviceDuration: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 5,
  },
  selectedServiceText: {
    color: colors.background.default,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text.primary,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  bookButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: colors.background.default,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen; 