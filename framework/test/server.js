const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => res.send('Hello World! ' + Math.random()));
app.get('/:status', (req, res) => res.status(req.params.status).send(`Status: ${req.params.status}`));
app.post('/', (req, res) => res.send('Body: ' + JSON.stringify(req.body)));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
