import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
// Serve the public folder (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Root redirect ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.redirect('/signup.html');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍔  Foodies server running at http://localhost:${PORT}\n`);
  console.log(`   → Signup : http://localhost:${PORT}/signup.html`);
  console.log(`   → Login  : http://localhost:${PORT}/login.html\n`);
});

export default app;
