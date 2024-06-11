const axios = require('axios');

// Define the base URL for the API
const baseURL = 'http://localhost:3000/api';

// Define an array of driver data to be created
/*const drivers = [
  {
    name: 'Raj Sharma',
    username: 'rajsharma',
    password: 'password123',
    major: 'Computer Science',
    homeLocation: '123 Main St, San Francisco, CA',
    homeCoordinates: {
      latitude: 37.7749,
      longitude: -122.4194
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
    phoneNumber: '123-456-7890'
  },
  {
    name: 'Priya Singh',
    username: 'priyasingh',
    password: 'password456',
    major: 'English Literature',
    homeLocation: '456 Oak St, Oakland, CA',
    homeCoordinates: {
      latitude: 37.8044,
      longitude: -122.2697
    },
    schedule: {
      monday: '02:00 PM',
      tuesday: '03:00 PM',
      wednesday: '04:00 PM',
      thursday: '05:00 PM',
      friday: '06:00 PM'
    },
    musicTastes: ['Classical', 'Jazz'],
    gender: 'Female',
    genderPreference: 'Same',
    phoneNumber: '234-567-8901'
  },
  {
    name: 'Arjun Kapoor',
    username: 'arjunkapoor',
    password: 'password789',
    major: 'Business Administration',
    homeLocation: '789 Maple Ave, Berkeley, CA',
    homeCoordinates: {
      latitude: 37.8716,
      longitude: -122.2727
    },
    schedule: {
      monday: '07:00 AM',
      tuesday: '08:00 AM',
      wednesday: '09:00 AM',
      thursday: '10:00 AM',
      friday: '11:00 AM'
    },
    musicTastes: ['Hip-Hop', 'R&B'],
    gender: 'Male',
    genderPreference: 'All',
    phoneNumber: '345-678-9012'
  },
  {
    name: 'Rani Chopra',
    username: 'ranichopra',
    password: 'password012',
    major: 'Psychology',
    homeLocation: '246 Pine St, San Jose, CA',
    homeCoordinates: {
      latitude: 37.3382,
      longitude: -121.8863
    },
    schedule: {
      monday: '12:00 PM',
      tuesday: '01:00 PM',
      wednesday: '02:00 PM',
      thursday: '03:00 PM',
      friday: '04:00 PM'
    },
    musicTastes: ['Rock', 'Classical'],
    gender: 'Female',
    genderPreference: 'All',
    phoneNumber: '456-789-0123'
  },
  {
    name: 'Vikram Reddy',
    username: 'vikramreddy',
    password: 'password345',
    major: 'Mechanical Engineering',
    homeLocation: '567 Cedar Rd, Fremont, CA',
    homeCoordinates: {
      latitude: 37.5483,
      longitude: -121.9886
    },
    schedule: {
      monday: '05:00 PM',
      tuesday: '06:00 PM',
      wednesday: '07:00 PM',
      thursday: '08:00 PM',
      friday: '09:00 PM'
    },
    musicTastes: ['EDM', 'Pop'],
    gender: 'Male',
    genderPreference: 'Same',
    phoneNumber: '567-890-1234'
  }
];
*/
// Function to create a driver in the database
async function createDriver(driverData) {
  try {
    const response = await axios.post(`${baseURL}/driver-signup`, driverData);
    console.log(`Driver ${driverData.name} created successfully`);
  } catch (error) {
    console.error(`Error creating driver ${driverData.name}:`, error.response.data);
  }
}

// Loop through the drivers array and create each driver in the database
drivers.forEach(async (driverData) => {
  await createDriver(driverData);
});