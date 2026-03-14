const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('test.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading test.html');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else if (req.url === '/css/style.css') {
        fs.readFile('css/style.css', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading style.css');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(data);
        });
    } else if (req.url.startsWith('/js/')) {
        const filePath = req.url.substring(1);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading ' + filePath);
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8000, () => {
    console.log('Test server running on http://localhost:8000');
    console.log('Open http://localhost:8000 in your browser to run regression tests');
});
