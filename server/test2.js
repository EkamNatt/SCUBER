const axios = require('axios');

// Define the base URL for the API
const baseURL = 'http://localhost:3000/api';

// Passenger data
const passengerData = {
  name: 'Amit Patel',
  username: 'amitpatel',
  password: 'password123',
  major: 'Computer Science',
  homeLocation: '789 Main St, San Jose, CA',
  homeCoordinates: {
    latitude: 37.3361,
    longitude: -121.8909
  },
  schedule: {
    monday: '09:00 AM',
    tuesday: '10:00 AM',
    wednesday: '11:00 AM',
    thursday: '12:00 PM',
    friday: '01:00 PM'
  },
  musicTastes: ['Rock', 'Pop'],
  gender: 'Male',
  genderPreference: 'All',
  phoneNumber: '678-901-2345'
};

// Function to create a passenger in the database
async function createPassenger(passengerData) {
  try {
    const response = await axios.post(`${baseURL}/passenger-signup`, passengerData);
    console.log('Passenger created successfully');
  } catch (error) {
    console.error('Error creating passenger:', error.response.data);
  }
}

// Function to fetch the JWT token for a passenger
async function getPassengerToken(username, password) {
  try {
    const response = await axios.post(`${baseURL}/passenger-login`, { username, password });
    const token = response.data.token;
    console.log(`JWT token for passenger ${username}:`, token);
    return token;
  } catch (error) {
    console.error('Error logging in as passenger:', error.response.data);
  }
}

// Create a passenger in the database
createPassenger(passengerData)
  .then(() => {
    // Fetch the JWT token for the passenger
    getPassengerToken(passengerData.username, passengerData.password);
  })
  .catch(error => {
    console.error('Error:', error);
  });