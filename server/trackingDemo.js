/**
 * Grow Carry - Live Tracking Demo Script
 * ======================================
 * Run this AFTER placing an order and being logged in as ADMIN.
 * 
 * Steps:
 *  1. Log in as admin at http://localhost:5173
 *  2. Go to Admin → Orders, note the Order ID
 *  3. Edit the ORDER_ID and ADMIN_TOKEN below
 *  4. Open the tracking page: http://localhost:5173/orders/<ORDER_ID>/live-tracking
 *  5. Run this script: node server/trackingDemo.js
 *     Watch the browser update in REAL-TIME every 4 seconds!
 */

const fetch = require('node-fetch');  // uses built-in if Node 18+

const ORDER_ID = 'REPLACE_WITH_ORDER_ID';   // ← Paste your Order ID here
const ADMIN_TOKEN = 'REPLACE_WITH_ADMIN_TOKEN'; // ← Paste your JWT token from browser localStorage

const BASE_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const advance = async (stage) => {
  try {
    const res = await fetch(`${BASE_URL}/tracking/${ORDER_ID}/advance`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (data.success) {
      console.log(`✅ Stage advanced → ${data.currentStage.label}`);
    } else {
      console.log('⛔ Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

const runDemo = async () => {
  console.log('\n🛵 Grow Carry Live Tracking Demo Starting...');
  console.log(`📦 Order: ${ORDER_ID}`);
  console.log(`🌐 Watch live at: http://localhost:5173/orders/${ORDER_ID}/live-tracking\n`);

  const STAGES = 6;
  for (let i = 0; i < STAGES; i++) {
    await advance(i);
    if (i < STAGES - 1) {
      console.log('   ⏱  Waiting 4 seconds before next stage...');
      await delay(4000);
    }
  }

  console.log('\n🎉 Demo complete! Order delivered successfully!');
};

runDemo();
