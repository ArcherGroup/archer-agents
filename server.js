const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'online',
    service: 'Archer Agent Server',
    version: '1.0.0'
  }));
});

server.listen(PORT, () => {
  console.log(`Archer Agent Server draait op poort ${PORT}`);
});
