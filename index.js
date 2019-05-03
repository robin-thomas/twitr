const express = require('express');
const cors = require('cors');
const _ = require('lodash');

const app = express();
const port = !_.isUndefined(process.env.PORT) ? process.env.PORT : 4000;

app.use(cors());
app.use(express.json());
app.options('*', cors());
app.use(express.static(__dirname + '/src'));

app.listen(port, () => console.log(`app listening on ${port}`));
