const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let users = {}; // Store active users { email: ws }

wss.on('connection', (ws) => {
  console.log('New connection established');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      ws.email = data.email; // Store user email on WebSocket connection
      users[data.email] = ws;
      console.log(`${data.email} joined.`);
      sendUserList();
    }

    if (data.type === 'chatMessage') {
      if (users[data.receiver]) {
        users[data.receiver].send(JSON.stringify({
          type: 'chatMessage',
          sender: data.sender,
          message: data.message
        }));
      }
    }

    if (['videoOffer', 'videoAnswer', 'iceCandidate'].includes(data.type)) {
      if (users[data.receiver]) {
        users[data.receiver].send(JSON.stringify(data));
      }
    }
  });

  ws.on('close', () => {
    if (ws.email) {
      delete users[ws.email];
      sendUserList();
    }
  });

  function sendUserList() {
    const userList = Object.keys(users);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'userList', users: userList }));
      }
    });
  }
});
