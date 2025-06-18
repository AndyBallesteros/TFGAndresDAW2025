const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Solo POST.' });
  }

  const { nombre, email, asunto, mensaje, recaptchaToken } = req.body;

  if (!nombre || !email || !asunto || !mensaje || !recaptchaToken) {
    return res.status(400).json({ success: false, message: 'Todos los campos y el token de reCAPTCHA son obligatorios.' });
  }

  try {
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`;
    
    const recaptchaResponse = await fetch(recaptchaVerifyUrl, { method: 'POST' }).then(r => r.json());

    if (!recaptchaResponse.success) {
      console.error('Verificación de reCAPTCHA fallida:', recaptchaResponse['error-codes']);
      return res.status(400).json({ success: false, message: 'La verificación de seguridad (reCAPTCHA) falló. Inténtalo de nuevo.' });
    }
  } catch (recaptchaError) {
    console.error('Error al verificar reCAPTCHA en el backend:', recaptchaError);
    return res.status(500).json({ success: false, message: 'Error interno al verificar la seguridad. Inténtalo de nuevo.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER, 
    replyTo: email,
    subject: `Contacto desde Politólogos en Acción: ${asunto}`,
    html: `
      <p><strong>De:</strong> ${nombre} (${email})</p>
      <p><strong>Asunto:</strong> ${asunto}</p>
      <p><strong>Mensaje:</strong></p>
      <p style="white-space: pre-wrap;">${mensaje}</p> <!-- Usa pre-wrap para mantener saltos de línea -->
      <hr>
      <p><small>Este mensaje fue enviado a través del formulario de contacto de Politólogos en Acción.</small></p>
    `,
    text: `De: ${nombre} (${email})\nAsunto: ${asunto}\nMensaje: ${mensaje}` 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito desde Vercel Serverless Function.');
    res.status(200).json({ success: true, message: 'Mensaje enviado con éxito. Te contactaremos pronto.' });
  } catch (error) {
    console.error('Error al enviar el correo desde Vercel Serverless Function:', error);
    res.status(500).json({ success: false, message: 'Hubo un error al enviar tu mensaje. Inténtalo de nuevo más tarde.', error: error.message });
  }
};
