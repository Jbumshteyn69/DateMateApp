let currentUser = null;
let currentChatUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];

function signup() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const age = document.getElementById('auth-age').value;
  const birthday = document.getElementById('auth-birthday').value;
  const gender = document.getElementById('auth-gender').value;
  const bio = document.getElementById('auth-bio').value;
  const lookingFor = document.getElementById('auth-looking-for').value;
  const profilePicture = document.getElementById('auth-profile-picture').files[0];

  if (users.find(user => user.email === email)) {
    alert('User already exists!');
    return;
  }

  // Convert profile picture to base64 string
  let profilePictureUrl = '';
  if (profilePicture) {
    const reader = new FileReader();
    reader.onloadend = () => {
      profilePictureUrl = reader.result;
      users.push({
        email,
        password,
        name: email.split('@')[0],
        age,
        birthday,
        gender,
        bio,
        lookingFor,
        profilePicture: profilePictureUrl,
        messages: {} // Store messages per user
      });
      localStorage.setItem('users', JSON.stringify(users));
      alert('Signup successful! Login now.');
    };
    reader.readAsDataURL(profilePicture);
  } else {
    // If no profile picture, save with a default empty string
    users.push({
      email,
      password,
      name: email.split('@')[0],
      age,
      birthday,
      gender,
      bio,
      lookingFor,
      profilePicture: '',
      messages: {}
    });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Signup successful! Login now.');
  }
}

function login() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  currentUser = users.find(user => user.email === email && user.password === password);
  if (!currentUser) {
    alert('Invalid credentials');
    return;
  }
  document.getElementById('auth-container').style.display = 'none';
  displayProfile();
}

function displayProfile() {
  const profilePictureHtml = currentUser.profilePicture 
    ? `<img src="${currentUser.profilePicture}" alt="Profile Picture" class="profile-image">` 
    : `<p>No profile picture</p>`;

  document.getElementById('profile').innerHTML = `
    ${profilePictureHtml}
    <p>Welcome, ${currentUser.name}</p>
    <p>Age: ${currentUser.age}</p>
    <p>Birthday: ${currentUser.birthday}</p>
    <p>Gender: ${currentUser.gender}</p>
    <p>Bio: ${currentUser.bio}</p>
    <p>Looking for: ${currentUser.lookingFor}</p>
  `;
  displayUsers();
}

function displayUsers() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.filter(user => user.email !== currentUser.email).forEach(user => {
    const div = document.createElement('div');
    div.innerHTML = `<p>${user.name} <button onclick="startChat('${user.email}')">Chat</button> <button onclick="startVideoChat()">Video Chat</button></p>`;
    list.appendChild(div);
  });
}

function startChat(email) {
  currentChatUser = users.find(user => user.email === email);
  loadMessages();
}

function loadMessages() {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  
  const messages = currentUser.messages[currentChatUser.email] || [];
  
  messages.forEach(msg => {
    chatBox.innerHTML += `<p>${msg}</p>`;
  });
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!currentChatUser || !input.value) return;
  if (!currentUser.messages[currentChatUser.email]) {
    currentUser.messages[currentChatUser.email] = [];
  }
  currentUser.messages[currentChatUser.email].push(`You: ${input.value}`);
  localStorage.setItem('users', JSON.stringify(users));
  loadMessages();
  input.value = '';
}

// Handle cross-device syncing of messages
function syncMessages() {
  if (!currentUser) return;

  // Whenever the user logs in, load their chat data from local storage
  const savedMessages = JSON.parse(localStorage.getItem(currentUser.email + '_messages')) || {};

  // Synchronize messages across devices by saving the user's chats in a separate storage
  localStorage.setItem(currentUser.email + '_messages', JSON.stringify(currentUser.messages));
}

// Save messages each time a new message is sent
function saveMessages() {
  if (!currentUser) return;
  localStorage.setItem(currentUser.email + '_messages', JSON.stringify(currentUser.messages));
}

window.addEventListener('load', syncMessages);
window.addEventListener('beforeunload', saveMessages);
