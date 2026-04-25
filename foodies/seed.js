const sql = require('mssql');

const config = {
  server: 'db49145.public.databaseasp.net',
  database: 'db49145',
  user: 'db49145',
  password: 'Ts4!3_nK%S7p',
  options: { encrypt: true, trustServerCertificate: true },
};

const restaurants = [
  { name: 'Cairo Grill', location: 'Maadi, Cairo', dt: 30, dp: 15, open: '09:00', close: '23:00' },
  { name: 'Buffalo Burger', location: 'Zamalek, Cairo', dt: 25, dp: 10, open: '10:00', close: '02:00' },
  { name: 'Zooba', location: 'Dokki, Cairo', dt: 20, dp: 12, open: '08:00', close: '22:00' },
  { name: 'Kazoku Sushi', location: 'Heliopolis, Cairo', dt: 40, dp: 20, open: '12:00', close: '23:00' },
  { name: 'Bab El-Sharq', location: 'Nasr City, Cairo', dt: 35, dp: 18, open: '11:00', close: '01:00' },
  { name: 'The Smokery', location: 'New Cairo', dt: 45, dp: 25, open: '09:00', close: '23:00' },
  { name: 'Pie Pizza', location: 'Sheikh Zayed', dt: 30, dp: 15, open: '11:00', close: '00:00' },
  { name: 'Sobhy Kaber', location: 'Downtown Cairo', dt: 20, dp: 8, open: '07:00', close: '02:00' },
  { name: 'Tikka Nation', location: '6th October', dt: 35, dp: 14, open: '12:00', close: '23:00' },
  { name: 'Sea Breeze', location: 'Maadi, Cairo', dt: 50, dp: 30, open: '10:00', close: '22:00' },
];

const itemSets = [
  ['Grilled Chicken','Beef Kofta','Mixed Grill','Fattoush Salad','Hummus Plate','Grilled Shrimp','Lamb Chops','Rice Bowl','Garlic Bread','Kunafa'],
  ['Classic Burger','Cheese Burger','BBQ Burger','Chicken Burger','Fries','Onion Rings','Milkshake','Coleslaw','Nuggets','Ice Cream'],
  ['Falafel Wrap','Koshari','Hawawshi','Ful Medames','Taameya Plate','Molokhia','Stuffed Vine Leaves','Shawarma','Lentil Soup','Basbousa'],
  ['Salmon Roll','Tuna Sashimi','Dragon Roll','Miso Soup','Edamame','California Roll','Tempura','Gyoza','Ramen','Matcha Cake'],
  ['Chicken Shawarma','Kebab Plate','Fattah','Moussaka','Vine Leaves','Baba Ghanoush','Kibbeh','Tabbouleh','Manakeesh','Baklava'],
  ['Smoked Salmon','Brisket Plate','Pulled Pork','Smoked Wings','Caesar Salad','Mac & Cheese','Cornbread','Ribs','Turkey Wrap','Cheesecake'],
  ['Margherita Pizza','Pepperoni Pizza','BBQ Chicken Pizza','Garlic Knots','Pasta Alfredo','Calzone','Bruschetta','Tiramisu','Caprese Salad','Lemonade'],
  ['Koshary Special','Liver Sandwich','Sausage Plate','Molokhia Bowl','Grilled Pigeon','Ful Sandwich','Taameya Sandwich','Tehina Salad','Rice Pudding','Hibiscus Juice'],
  ['Tikka Masala','Butter Chicken','Biryani','Naan Bread','Samosa','Paneer Tikka','Dal Soup','Mango Lassi','Gulab Jamun','Raita'],
  ['Grilled Sea Bass','Calamari','Fish & Chips','Shrimp Pasta','Lobster Bisque','Crab Cakes','Oysters','Clam Chowder','Seafood Paella','Creme Brulee'],
];

async function seed() {
  const pool = await sql.connect(config);
  console.log('Connected. Seeding...');

  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    const res = await pool.request()
      .input('name', sql.NVarChar, r.name)
      .input('location', sql.NVarChar, r.location)
      .input('dt', sql.Int, r.dt)
      .input('dp', sql.Float, r.dp)
      .input('open', sql.NVarChar, r.open)
      .input('close', sql.NVarChar, r.close)
      .query(`INSERT INTO [Restaurant] (name, rating, delivery_time, min_delivery_time, max_delivery_time, delivery_price, location, open_time, close_time)
              OUTPUT INSERTED.id VALUES (@name, ${(3 + Math.random() * 2).toFixed(1)}, @dt, @dt, @dt+15, @dp, @location, @open, @close)`);
    const rid = res.recordset[0].id;
    console.log(`  Restaurant #${rid}: ${r.name}`);

    const items = itemSets[i];
    for (let j = 0; j < items.length; j++) {
      const price = +(10 + Math.random() * 90).toFixed(2);
      const qty = Math.floor(5 + Math.random() * 50);
      const isCombo = j % 3 === 0 ? 1 : 0;
      const size = ['Regular', 'Large', 'Small'][j % 3];
      await pool.request()
        .input('rid', sql.Int, rid)
        .input('name', sql.NVarChar, items[j])
        .input('price', sql.Float, price)
        .input('qty', sql.Int, qty)
        .input('combo', sql.Bit, isCombo)
        .input('size', sql.NVarChar, size)
        .input('desc', sql.NVarChar, `Delicious ${items[j].toLowerCase()} prepared fresh.`)
        .query(`INSERT INTO [Menu_item] (restaurant_id, name, price, item_quantity, is_combo, item_size, description, is_on_discount, discount_percentage)
                VALUES (@rid, @name, @price, @qty, @combo, @size, @desc, 0, 0)`);
    }
    console.log(`    -> ${items.length} items added`);
  }

  console.log('Done! Seeded 10 restaurants with 10 items each.');
  await pool.close();
}

seed().catch(e => { console.error(e); process.exit(1); });
