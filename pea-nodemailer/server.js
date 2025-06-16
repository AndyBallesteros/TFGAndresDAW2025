require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/contact', async (req, res) => {
  const { nombre, email, asunto, mensaje, recaptchaToken } = req.body;
  console.log('Backend recibió token de reCAPTCHA:', recaptchaToken);

  if (!nombre || !email || !asunto || !mensaje || !recaptchaToken) {
    return res.status(400).json({ success: false, message: 'Todos los campos y el Captcha son obligatorios.' });
  }

  try {
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    console.log('Clave secreta usada para verificar:', recaptchaSecretKey ? '*****' : 'NO_DEFINIDA');

    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`;

    const recaptchaResponse = await axios.post(recaptchaVerifyUrl);
    const { success, score } = recaptchaResponse.data;
    
    console.log('Respuesta de verificación de reCAPTCHA de Google:', recaptchaResponse.data);

    if (!success || (score && score < 0.5)) {
      console.warn('Fallo de verificación de reCAPTCHA:', recaptchaResponse.data);
      return res.status(403).json({ success: false, message: 'Verificación de reCAPTCHA fallida. ¿Eres un robot?' });
    }
  } catch (captchaError) {
    console.error('Error al verificar reCAPTCHA:', captchaError);
    return res.status(500).json({ success: false, message: 'Error interno al verificar reCAPTCHA.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.ADMIN_EMAIL, 
    subject: `Mensaje de contacto: ${asunto}`,
    html: `
      <p>Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio web.</p>
      <ul>
        <li><strong>Nombre:</strong> ${nombre}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Asunto:</strong> ${asunto}</li>
      </ul>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado con éxito');
    res.status(200).json({ success: true, message: 'Mensaje enviado con éxito.' });
  } catch (error) {
    console.error('Error al enviar el email:', error);
    res.status(500).json({ success: false, message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de backend escuchando en http://localhost:${PORT}`);
});