const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New connection established');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'chatMessage') {
      // Broadcast chat message to the correct recipient
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (client.email === data.receiver) {
            client.send(JSON.stringify({
              type: 'chatMessage',
              sender: data.sender,
              message: data.message
            }));
          }
        }
      });
    }

    if (data.type === 'videoOffer' || data.type === 'videoAnswer' || data.type === 'iceCandidate') {
      // Broadcast video offer/answer or ICE candidates to the recipient
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (client.email === data.receiver) {
            client.send(JSON.stringify(data));
          }
        }
      });
    }
  });
});
