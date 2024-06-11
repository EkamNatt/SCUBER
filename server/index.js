const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cors = require('cors');  // Import CORS module
const jwt = require('jsonwebtoken');  // Import jsonwebtoken

const app = express();
app.use(bodyParser.json());
app.use(cors());  // Enable CORS for all routes

// Create a Sequelize instance and connect to the SQLite database
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const SECRET_KEY = 'DjaPwuM8cYsVRXT64Kbu5qp_s-1lGvxewOtWwl_EklY';

// Define the Driver model
const Driver = sequelize.define('Driver', {
  name: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  major: Sequelize.STRING,
  homeLocation: Sequelize.STRING,
  homeLatitude: Sequelize.FLOAT,
  homeLongitude: Sequelize.FLOAT,
  scheduleMonday: Sequelize.STRING,
  scheduleTuesday: Sequelize.STRING,
  scheduleWednesday: Sequelize.STRING,
  scheduleThursday: Sequelize.STRING,
  scheduleFriday: Sequelize.STRING,
  musicTastes: Sequelize.JSON,
  gender: Sequelize.STRING,
  genderPreference: Sequelize.STRING,
  phoneNumber: Sequelize.STRING,
});

const Passenger = sequelize.define('Passenger', {
  name: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  major: Sequelize.STRING,
  homeLocation: Sequelize.STRING,
  homeLatitude: Sequelize.FLOAT,
  homeLongitude: Sequelize.FLOAT,
  scheduleMonday: Sequelize.STRING,
  scheduleTuesday: Sequelize.STRING,
  scheduleWednesday: Sequelize.STRING,
  scheduleThursday: Sequelize.STRING,
  scheduleFriday: Sequelize.STRING,
  musicTastes: Sequelize.JSON,
  gender: Sequelize.STRING,
  genderPreference: Sequelize.STRING,
  phoneNumber: Sequelize.STRING,
});

// Sync the model with the database
sequelize.sync();

app.get('/', (req, res) => {
  res.send('Welcome to the SCUBER API');
});

// Create an endpoint to handle driver signup
app.post('/api/driver-signup', (req, res) => {
  const driverData = req.body;

  // Create a new driver in the database
  Driver.create({
    name: driverData.name,
    username: driverData.username,
    password: driverData.password,
    major: driverData.major,
    homeLocation: driverData.homeLocation,
    homeLatitude: driverData.homeCoordinates.latitude,
    homeLongitude: driverData.homeCoordinates.longitude,
    scheduleMonday: driverData.schedule.monday,
    scheduleTuesday: driverData.schedule.tuesday,
    scheduleWednesday: driverData.schedule.wednesday,
    scheduleThursday: driverData.schedule.thursday,
    scheduleFriday: driverData.schedule.friday,
    musicTastes: driverData.musicTastes,
    gender: driverData.gender,
    genderPreference: driverData.genderPreference,
    phoneNumber: driverData.phoneNumber,
  })
    .then(() => {
      res.status(200).json({ message: 'Driver signed up successfully' });
    })
    .catch((error) => {
      console.error('Error signing up driver:', error);
      res.status(500).json({ error: 'An error occurred while signing up' });
    });
});

// Create an endpoint to handle passenger signup
app.post('/api/passenger-signup', (req, res) => {
  const passengerData = req.body;

  // Create a new passenger in the database
  Passenger.create({
    name: passengerData.name,
    username: passengerData.username,
    password: passengerData.password,
    major: passengerData.major,
    homeLocation: passengerData.homeLocation,
    homeLatitude: passengerData.homeCoordinates.latitude,
    homeLongitude: passengerData.homeCoordinates.longitude,
    scheduleMonday: passengerData.schedule.monday,
    scheduleTuesday: passengerData.schedule.tuesday,
    scheduleWednesday: passengerData.schedule.wednesday,
    scheduleThursday: passengerData.schedule.thursday,
    scheduleFriday: passengerData.schedule.friday,
    musicTastes: passengerData.musicTastes,
    gender: passengerData.gender,
    genderPreference: passengerData.genderPreference,
    phoneNumber: passengerData.phoneNumber,
  })
    .then(() => {
      res.status(200).json({ message: 'Passenger signed up successfully' });
    })
    .catch((error) => {
      console.error('Error signing up passenger:', error);
      res.status(500).json({ error: 'An error occurred while signing up' });
    });
});

app.post('/api/passenger-login', (req, res) => {
  const { username, password } = req.body;

  Passenger.findOne({ where: { username, password } })
    .then(passenger => {
      if (passenger) {
        // Generate token with user type
        const token = jwt.sign({ id: passenger.id, userType: 'passenger' }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Function to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decoded.id;
    req.userType = decoded.userType;
    next();
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Function to calculate music taste matches
function calculateMusicMatch(passengerMusicTastes, driverMusicTastes) {
  if (!passengerMusicTastes.length || !driverMusicTastes.length) {
    return 0; // Return 0 if either party has no music tastes defined
  }

  const matches = passengerMusicTastes.filter(taste => driverMusicTastes.includes(taste)).length;
  return matches / passengerMusicTastes.length; // Proportion of matches
}

// Function to normalize score to 1-10 range
function normalizeScore(score, maxScore) {
  return 1 + 9 * (score / maxScore); // Normalize to 1-10 range
}

app.post('/api/passengers/drivers', verifyToken, (req, res) => {
  const { priorities } = req.body;

  if (req.userType !== 'passenger') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  Passenger.findByPk(req.userId)
    .then(passenger => {
      if (!passenger) {
        return res.status(404).json({ error: 'Passenger not found' });
      }

      Driver.findAll()
        .then(drivers => {
          const maxScore = priorities.length + 1; // Maximum possible score (each priority + time matches)
          const sortedDrivers = drivers.map(driver => {
            let score = 0;
            let musicScore = 0; // Initialize music score
            const distance = calculateDistance(passenger.homeLatitude, passenger.homeLongitude, driver.homeLatitude, driver.homeLongitude);

            // Calculate scores based on priorities
            priorities.forEach(priority => {
              if (priority === 'musicTastes') {
                musicScore = calculateMusicMatch(passenger.musicTastes, driver.musicTastes);
                score += musicScore; // Add proportional music match score
              }
              if (priority === 'gender' && (passenger.genderPreference === 'All' || passenger.gender === driver.gender)) {
                score += 1;  // Increase score if gender preference matches
              }
              if (priority === 'distance') {
                score += 1 / (distance + 1); // Inverse of distance as score to prioritize closer drivers
              }
            });

            const normalizedScore = normalizeScore(score, maxScore); // Normalize the score to 1-10

            return {
              driver,
              score: normalizedScore,
              musicScore, // Include music score separately for debugging or detailed responses
              distance,
            };
          });

          sortedDrivers.sort((a, b) => b.score - a.score); // Sort by score descending

          res.json(sortedDrivers.map(driver => ({
            name: driver.driver.name,
            major: driver.driver.major,
            distance: driver.distance.toFixed(2) + ' km',
            score: driver.score.toFixed(2),
            musicScore: driver.musicScore.toFixed(2), // Display music score
            phoneNumber: driver.driver.phoneNumber,
          })));
        })
        .catch(error => {
          console.error('Error fetching drivers:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .catch(error => {
      console.error('Error fetching passenger:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


// Function to calculate music taste matches
function calculateMusicMatch(driverMusicTastes, passengerMusicTastes) {
  if (!driverMusicTastes.length || !passengerMusicTastes.length) {
    return 0; // Return 0 if either party has no music tastes defined
  }

  const matches = driverMusicTastes.filter(taste => passengerMusicTastes.includes(taste)).length;
  return matches / driverMusicTastes.length; // Proportion of matches
}

// Function to normalize score to 1-10 range
function normalizeScore(score, maxScore) {
  return 1 + 9 * (score / maxScore); // Normalize to 1-10 range
}

app.post('/api/drivers/passengers', verifyToken, (req, res) => {
  const { priorities } = req.body;

  if (req.userType !== 'driver') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  Driver.findByPk(req.userId)
    .then(driver => {
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      Passenger.findAll()
        .then(passengers => {
          const maxScore = priorities.length + 1; // Maximum possible score (each priority + time matches)
          const sortedPassengers = passengers.map(passenger => {
            let score = 0;
            let musicScore = 0; // Initialize music score
            const distance = calculateDistance(driver.homeLatitude, driver.homeLongitude, passenger.homeLatitude, passenger.homeLongitude);

            // Calculate scores based on priorities
            priorities.forEach(priority => {
              if (priority === 'musicTastes') {
                musicScore = calculateMusicMatch(driver.musicTastes, passenger.musicTastes);
                score += musicScore; // Add proportional music match score
              }
              if (priority === 'gender' && (driver.genderPreference === 'All' || passenger.gender === driver.gender)) {
                score += 1;  // Increase score if gender preference matches
              }
              if (priority === 'distance') {
                score += 1 / (distance + 1); // Inverse of distance as score to prioritize closer passengers
              }
            });

            const normalizedScore = normalizeScore(score, maxScore); // Normalize the score to 1-10

            return {
              passenger,
              score: normalizedScore,
              musicScore, // Include music score separately for debugging or detailed responses
              distance,
            };
          });

          sortedPassengers.sort((a, b) => b.score - a.score); // Sort by score descending

          res.json(sortedPassengers.map(passenger => ({
            name: passenger.passenger.name,
            major: passenger.passenger.major,
            distance: passenger.distance.toFixed(2) + ' km',
            score: passenger.score.toFixed(2),
            musicScore: passenger.musicScore.toFixed(2), // Display music score
            phoneNumber: passenger.passenger.phoneNumber,
          })));
        })
        .catch(error => {
          console.error('Error fetching passengers:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .catch(error => {
      console.error('Error fetching driver:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


app.post('/api/driver-login', (req, res) => {
  const { username, password } = req.body;

  Driver.findOne({ where: { username, password } })
    .then(driver => {
      if (driver) {
        // Generate token with user type
        const token = jwt.sign({ id: driver.id, userType: 'driver' }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});