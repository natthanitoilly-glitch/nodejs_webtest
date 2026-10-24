require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรกไปยังหน้าสมัครสมาชิก
app.get('/', (req, res) => {
  res.redirect('/register');
});

// หน้าแบบฟอร์มสมัครสมาชิก
app.get('/register', (req, res) => {
  res.render('register', {
    error: null,
    success: null,
    form: {}
  });
});

// บันทึกข้อมูลสมัครสมาชิก
app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    await pool.execute(
      `INSERT INTO members
       (first_name, last_name, email, password)
       VALUES (?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        password.trim(),
      ]
    );

    res.redirect('/members?registered=1');
  } catch (error) {
    console.error(error);
    res.status(500).send('เกิดข้อผิดพลาดในระบบ');
  }
});

// หน้าแสดงรายชื่อสมาชิก
app.get('/members', async (req, res) => {
  try {
    const [members] = await pool.execute(
      `SELECT *
       FROM members
       ORDER BY created_at DESC`
    );

    res.render('members', {
      members,
      registered: req.query.registered === '1'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('ไม่สามารถโหลดข้อมูลสมาชิกได้');
  }
});




app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});