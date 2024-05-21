// OpenStreetMap Nominatim API URL
const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=';

function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}

function validateTime(timeInput) {
    const timeRegex = /^(0[0-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    return timeRegex.test(timeInput);
}
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
}


function handleAddressInput() {
    const addressInput = document.getElementById('homeLocation');
    const suggestionsList = document.getElementById('suggestionsList');

    const address = addressInput.value;

    if (address.length >= 3) {
        fetchAddressSuggestions(address)
            .then(suggestions => {
                suggestionsList.innerHTML = '';

                suggestions.forEach(suggestion => {
                    const suggestionItem = document.createElement('li');
                    suggestionItem.textContent = suggestion;
                    suggestionItem.addEventListener('click', function() {
                        addressInput.value = suggestion;
                        suggestionsList.innerHTML = '';
                    });
                    suggestionsList.appendChild(suggestionItem);
                });
            })
            .catch(error => {
                console.error('Error fetching address suggestions:', error);
            });
    } else {
        suggestionsList.innerHTML = '';
    }
}

function fetchCoordinates(address) {
    return fetch(nominatimUrl + encodeURIComponent(address))
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
            }
            return null;
        });
}
function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
}
// Function to fetch address suggestions from the Nominatim API
function fetchAddressSuggestions(address) {
    return fetch(nominatimUrl + encodeURIComponent(address))
        .then(response => response.json())
        .then(data => {
            return data.map(item => item.display_name);
        });
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    const usernameErrorMessage = usernameInput.nextElementSibling;

    if (username === '') {
        usernameErrorMessage.textContent = 'Please enter a username';
        return;
    } else {
        usernameErrorMessage.textContent = '';
    }

    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    const passwordErrorMessage = passwordInput.nextElementSibling;

    if (password === '') {
        passwordErrorMessage.textContent = 'Please enter a password';
        return;
    } else {
        passwordErrorMessage.textContent = '';
    }

    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPassword = confirmPasswordInput.value;
    const confirmPasswordErrorMessage = confirmPasswordInput.nextElementSibling;

    if (confirmPassword === '') {
        confirmPasswordErrorMessage.textContent = 'Please confirm your password';
        return;
    } else if (!validatePasswordMatch(password, confirmPassword)) {
        confirmPasswordErrorMessage.textContent = 'Passwords do not match';
        confirmPasswordErrorMessage.style.color = 'red';
        confirmPasswordErrorMessage.style.fontWeight = 'bold';
        return;
    } else {
        confirmPasswordErrorMessage.textContent = '';
    }

    const scheduleInputs = document.querySelectorAll('#scheduleContainer input[type="text"]');
    let isValid = true;

    scheduleInputs.forEach(input => {
        const timeValue = input.value.trim();
        const errorMessage = input.nextElementSibling;

        if (timeValue === '' || !validateTime(timeValue)) {
            errorMessage.textContent = 'Please enter a valid time (e.g., 09:00 AM)';
            isValid = false;
        } else {
            errorMessage.textContent = '';
        }
    });

    if (!isValid) {
        return;
    }
    // Get form data
    const name = document.getElementById('name').value;
    const major = document.getElementById('major').value;
    const homeLocation = document.getElementById('homeLocation').value;
    const schedule = {
        monday: document.getElementById('scheduleMonday').value,
        tuesday: document.getElementById('scheduleTuesday').value,
        wednesday: document.getElementById('scheduleWednesday').value,
        thursday: document.getElementById('scheduleThursday').value,
        friday: document.getElementById('scheduleFriday').value
    };
    const musicTastes = Array.from(document.querySelectorAll('input[name="music"]:checked')).map(checkbox => checkbox.value);
    const gender = document.getElementById('gender').value;
    const genderPreference = document.querySelector('input[name="genderPreference"]:checked').value;
    const phoneNumberInput = document.getElementById('phoneNumber');
    const phoneNumber = phoneNumberInput.value.trim();
    const phoneNumberErrorMessage = phoneNumberInput.nextElementSibling;

    if (phoneNumber === '' || !validatePhoneNumber(phoneNumber)) {
        phoneNumberErrorMessage.textContent = 'Please enter a valid phone number (e.g., 123-456-7890)';
        return;
    } else {
        phoneNumberErrorMessage.textContent = '';
    }
    fetchCoordinates(homeLocation)
        .then(coordinates => {
            if (coordinates) {
                const { latitude, longitude } = coordinates;

                // Create JSON object
                const driverData = {
                    name: name,
                    username: username,
                    password: password,
                    major: major,
                    homeLocation: homeLocation,
                    homeCoordinates: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    schedule: schedule,
                    musicTastes: musicTastes,
                    gender: gender,
                    genderPreference: genderPreference,
                    phoneNumber: phoneNumber
                };

                // Send data to server
                fetch('http://localhost:3000/api/driver-signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(driverData)
                })
                    .then(response => {
                        if (response.ok) {
                            // Redirect to driver login page
                            window.location.href = 'driver-login.html';
                        } else {
                            // Handle error
                            console.error('Error signing up as a driver');
                        }
                    });
            } else {
                console.error('Failed to fetch coordinates for the home location');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
}

// Add event listener to the form submission
document.getElementById('driverSignupForm').addEventListener('submit', handleSubmit);
document.getElementById('homeLocation').addEventListener('input', debounce(handleAddressInput, 500));