import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initializeDatabase } from './schema';
import { UserStore } from './models/user.model';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import itemRoutes from './routes/item.routes';
import addressRoutes from './routes/address.routes';
import offerRoutes from './routes/offer.routes';
import cartRoutes from './routes/cart.routes';
import searchRoutes from './routes/search.routes';
import checkoutRoutes from './routes/checkout.routes';

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
app.use('/api/offers', offerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/checkout', checkoutRoutes);

// ─── Root redirect ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.redirect('/signup.html');
});

// ─── Seed Admin User ──────────────────────────────────────────────────────────
async function seedAdmin(): Promise<void> {
  try {
    const exists = await UserStore.emailExists('admin@foodies.com');
    if (!exists) {
      const hash = await bcrypt.hash('Admin@123', 10);
      await UserStore.add({
        email: 'admin@foodies.com',
        passwordHash: hash,
        userName: 'Admin',
        isAdmin: true,
      });
      console.log('  🔑  Admin seeded → admin@foodies.com / Admin@123');
    } else {
      console.log('  🔑  Admin already exists');
    }
  } catch (err) {
    console.error('  ❌  Failed to seed admin:', err);
  }
}

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer(): Promise<void> {
  try {
    // Initialize database tables
    await initializeDatabase();

    // Seed admin user
    await seedAdmin();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🍔  Foodies server running at http://localhost:${PORT}\n`);
      console.log(`   → Signup : http://localhost:${PORT}/signup.html`);
      console.log(`   → Login  : http://localhost:${PORT}/login.html`);
      console.log(`   → Admin  : http://localhost:${PORT}/admin.html  (admin@foodies.com / Admin@123)\n`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
