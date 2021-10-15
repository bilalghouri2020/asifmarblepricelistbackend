var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')





/* GET users listing. */
router.get('/', [
  check('firstname', 'Please Enter a first name').not().isEmpty(),
  check('lastname', 'Please enter a last name').not().isEmpty(),
  check('email', 'Please enter a valid email...').isEmail(),
  check('password', 'Please enter a password with 6 or more 10 characters...').not().isEmpty()
], async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const { firstname, lastname, email, password } = req.body

  try {

    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ errors: [{ msg: 'User already exists...' }] });
    }

    user = new User({
      firstname,
      lastname,
      email,
      password
    })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt);

    const response = await user.save();

    console.log(response);

  } catch (err) {
    console.log(err);
  }

  res.send('respond with a resource');
});

router.post('/', [
  check('firstname', 'Please Enter a first name').not().isEmpty(),
  check('lastname', 'Please enter a last name').not().isEmpty(),
  check('email', 'Please enter a valid email...').isEmail(),
  check('password', 'Please enter a password with 6 or more 10 characters...').not().isEmpty()
], async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('is Empty');
    return res.status(400).json({ errors: errors.array() })
  }

  const { firstname, lastname, email, password } = req.body

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.json({ errors: [{ msg: 'User already exists...', status: 1 }] });
      return;
    }

    user = new User({
      firstname,
      lastname,
      email,
      password
    })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt);
    const response = await user.save();
    console.log(response);

  } catch (err) {
    console.log(err);
  }
})

router.post('/login', [
  check('email', 'Please enter a valid email...').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('400 error 2')
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      (err, token) => {
        console.log('jwt')
        if (err) throw err;
        res.json({ token });
      }
    )




  } catch (err) {
    console.log(err, 'error found ')
  }

  console.log(req.body);
  // console.log('hello world');
  // res.json({ message: 'ok' })
})

module.exports = router;
