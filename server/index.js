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
          const sortedDrivers = drivers.map(driver => {
            let score = 0;
            let timeMatches = 0;

            // Calculate time matches
            const passengerSchedule = [
              passenger.scheduleMonday,
              passenger.scheduleTuesday,
              passenger.scheduleWednesday,
              passenger.scheduleThursday,
              passenger.scheduleFriday
            ];
            const driverSchedule = [
              driver.scheduleMonday,
              driver.scheduleTuesday,
              driver.scheduleWednesday,
              driver.scheduleThursday,
              driver.scheduleFriday
            ];
            timeMatches = passengerSchedule.filter((time, index) => time === driverSchedule[index]).length;

            // Calculate scores based on priorities
            priorities.forEach(priority => {
              if (priority === 'musicTastes') {
                const musicMatch = passenger.musicTastes.some(genre => driver.musicTastes.includes(genre));
                score += musicMatch ? 1 : 0;
              } else if (priority === 'gender') {
                score += passenger.genderPreference === 'All' || passenger.gender === driver.gender ? 1 : 0;
              } else if (priority === 'distance') {
                const distance = calculateDistance(passenger.homeLatitude, passenger.homeLongitude, driver.homeLatitude, driver.homeLongitude);
                score += 1 / (distance + 1); // Inverse of distance as score
              }
            });

            const totalPriorities = priorities.length + 1; // +1 for time matches
            const similarityScore = (score + timeMatches) / totalPriorities;

            return {
              driver,
              score,
              timeMatches,
              distance: calculateDistance(passenger.homeLatitude, passenger.homeLongitude, driver.homeLatitude, driver.homeLongitude),
              similarityScore
            };
          });

          // Sort drivers based on time matches first, then distance, then similarity score
          sortedDrivers.sort((a, b) => {
            if (b.timeMatches !== a.timeMatches) {
              return b.timeMatches - a.timeMatches;
            } else if (a.distance !== b.distance) {
              return a.distance - b.distance;
            } else {
              return b.similarityScore - a.similarityScore;
            }
          });

          res.json(sortedDrivers);
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
          const sortedPassengers = passengers.map(passenger => {
            let score = 0;
            let timeMatches = 0;

            // Calculate time matches
            const passengerSchedule = [
              passenger.scheduleMonday,
              passenger.scheduleTuesday,
              passenger.scheduleWednesday,
              passenger.scheduleThursday,
              passenger.scheduleFriday
            ];
            const driverSchedule = [
              driver.scheduleMonday,
              driver.scheduleTuesday,
              driver.scheduleWednesday,
              driver.scheduleThursday,
              driver.scheduleFriday
            ];
            timeMatches = passengerSchedule.filter((time, index) => time === driverSchedule[index]).length;

            // Calculate scores based on priorities
            priorities.forEach(priority => {
              if (priority === 'musicTastes') {
                const musicMatch = driver.musicTastes.some(genre => passenger.musicTastes.includes(genre));
                score += musicMatch ? 1 : 0;
              } else if (priority === 'gender') {
                score += driver.genderPreference === 'All' || driver.gender === passenger.gender ? 1 : 0;
              } else if (priority === 'distance') {
                const distance = calculateDistance(driver.homeLatitude, driver.homeLongitude, passenger.homeLatitude, passenger.homeLongitude);
                score += 1 / (distance + 1); // Inverse of distance as score
              }
            });

            const totalPriorities = priorities.length + 1; // +1 for time matches
            const similarityScore = (score + timeMatches) / totalPriorities;

            return {
              passenger,
              score,
              timeMatches,
              distance: calculateDistance(driver.homeLatitude, driver.homeLongitude, passenger.homeLatitude, passenger.homeLongitude),
              similarityScore
            };
          });

          // Sort passengers based on time matches first, then distance, then similarity score
          sortedPassengers.sort((a, b) => {
            if (b.timeMatches !== a.timeMatches) {
              return b.timeMatches - a.timeMatches;
            } else if (a.distance !== b.distance) {
              return a.distance - b.distance;
            } else {
              return b.similarityScore - a.similarityScore;
            }
          });

          res.json(sortedPassengers);
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
