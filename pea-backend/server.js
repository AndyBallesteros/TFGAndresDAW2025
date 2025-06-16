const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para cifrado de contraseñas

const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Apunta a tu archivo de datos
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'tu_secreto_super_seguro'; // ¡Cambia esto por una cadena más compleja en producción!
const expiresIn = '1h'; // Duración del token

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cors()); // Habilita CORS para todas las rutas
server.use(middlewares);

// Función para generar token de acceso
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Función para verificar si el usuario existe
function isAuthenticated({ email, password }) {
  const userdb = router.db.get('users').value();
  const user = userdb.find(user => user.email === email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return null;
}

// Función para verificar si el email ya está registrado
function emailExists(email) {
  return router.db.get('users').value().some(user => user.email === email);
}

// Middleware de autenticación para rutas protegidas
server.use((req, res, next) => {
  if (['/users', '/articles'].includes(req.path) && req.method !== 'GET') {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded; // Añade la información del usuario al request
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión de nuevo.' });
      }
      return res.status(401).json({ message: 'Token inválido.' });
    }
  } else {
    next();
  }
});

// Rutas de autenticación personalizadas

// REGISTRO
server.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (emailExists(email)) {
    return res.status(400).json({ message: 'El email ya está registrado.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8); // Cifra la contraseña

  const id = Date.now(); // Genera un ID simple basado en el timestamp
  const newUser = { id, username, email, password: hashedPassword };

  router.db.get('users').push(newUser).write();

  const token = createToken({ email, id: newUser.id, username });
  res.status(201).json({ token, user: { id: newUser.id, username, email } });
});

// LOGIN
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = isAuthenticated({ email, password });

  if (!user) {
    const userdb = router.db.get('users').value();
    const existingUser = userdb.find(u => u.email === email);

    if (existingUser && !bcrypt.compareSync(password, existingUser.password)) {
      return res.status(400).json({ message: 'Credenciales inválidas. Contraseña incorrecta.' });
    } else if (!existingUser) {
      return res.status(400).json({ message: 'Credenciales inválidas. Usuario no encontrado.' });
    }
    return res.status(400).json({ message: 'Credenciales inválidas.' });
  }

  const token = createToken({ email, id: user.id, username: user.username });
  res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
});


// Rutas personalizadas para artículos (añadir automáticamente el ID del autor)
server.post('/articles', (req, res, next) => {
  // Solo se ejecuta si el middleware de autenticación ya ha añadido req.user
  if (req.user && req.body) {
    req.body.authorId = req.user.id; // Asigna el ID del usuario logueado
    req.body.authorName = req.user.username; // Asigna el nombre de usuario
    req.body.date = new Date().toISOString(); // Fecha de creación
  }
  // Continúa con la lógica de Json-Server para POST
  next();
});

// Usar el enrutador de json-server para el resto de las rutas (GET /users, GET /articles, etc.)
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server with Auth is running on http://localhost:${PORT}`);
});