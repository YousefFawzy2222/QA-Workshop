import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import itemRoutes from './routes/item.routes';
import addressRoutes from './routes/address.routes';

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
app.use('/api/admin/restaurants', restaurantRoutes);
app.use('/api/admin/restaurants/:restaurantId/items', itemRoutes);
app.use('/api/addresses', addressRoutes);

// ─── Root redirect ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.redirect('/signup.html');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍔  Foodies server running at http://localhost:${PORT}\n`);
  console.log(`   → Signup : http://localhost:${PORT}/signup.html`);
  console.log(`   → Login  : http://localhost:${PORT}/login.html`);
  console.log(`   → Admin  : http://localhost:${PORT}/admin.html  (admin@foodies.com / Admin@123)\n`);
});

export default app;
