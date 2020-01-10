const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


// eslint-disable-next-line new-cap
const router = express.Router();

router.use(cors());
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.get('/', (req, res) => {
  res.redirect('/docs');
});

module.exports = router;
