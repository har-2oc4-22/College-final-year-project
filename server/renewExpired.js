const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Pantry = require('./models/Pantry');

dotenv.config();

const renewExpired = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    // 1. Renew expired product expiry dates (extend by 90 days from now)
    const expiredProducts = await Product.countDocuments({ expiryDate: { $lt: now, $ne: null } });
    const r1 = await Product.updateMany(
      { expiryDate: { $lt: now, $ne: null } },
      { $set: { expiryDate: in90Days } }
    );
    console.log(`🥫 Products with expired expiryDate: ${expiredProducts} → Renewed: ${r1.modifiedCount}`);

    // 2. Renew expired flash sales (extend by 30 days from now)
    const expiredFlash = await Product.countDocuments({
      'flashSale.active': true,
      'flashSale.expiresAt': { $lt: now }
    });
    const r2 = await Product.updateMany(
      { 'flashSale.active': true, 'flashSale.expiresAt': { $lt: now } },
      { $set: { 'flashSale.expiresAt': in30Days } }
    );
    console.log(`⚡ Expired flash sales: ${expiredFlash} → Renewed: ${r2.modifiedCount}`);

    // 3. Renew expired coupons (extend by 30 days, reactivate)
    const expiredCoupons = await Coupon.countDocuments({ expiresAt: { $lt: now, $ne: null } });
    const r3 = await Coupon.updateMany(
      { expiresAt: { $lt: now, $ne: null } },
      { $set: { expiresAt: in30Days, isActive: true } }
    );
    console.log(`🎟️  Expired coupons: ${expiredCoupons} → Renewed: ${r3.modifiedCount}`);

    // 4. Renew expired pantry items (extend by 30 days, set status to Fresh)
    const pantries = await Pantry.find({});
    let pantryItemCount = 0;
    for (const pantry of pantries) {
      let changed = false;
      for (const item of pantry.items) {
        if (item.expiryDate && item.expiryDate < now) {
          item.expiryDate = in30Days;
          item.status = 'Fresh';
          changed = true;
          pantryItemCount++;
        }
      }
      if (changed) await pantry.save();
    }
    console.log(`🥬 Expired pantry items: ${pantryItemCount} → Renewed: ${pantryItemCount}`);

    // 5. Also set products with null expiryDate to 90 days from now
    const nullExpiry = await Product.countDocuments({ expiryDate: null });
    const r5 = await Product.updateMany(
      { expiryDate: null },
      { $set: { expiryDate: in90Days } }
    );
    console.log(`📦 Products with no expiryDate set: ${nullExpiry} → Updated: ${r5.modifiedCount}`);

    console.log('\n✅ All expired items renewed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

renewExpired();
