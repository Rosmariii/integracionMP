const fs = require('fs');
const path = require('path');
const ordersFile = path.join(__dirname, 'orders.json');

function readOrders() {
  if (!fs.existsSync(ordersFile)) return [];
  const data = fs.readFileSync(ordersFile, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
}

function addOrder(order) {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

module.exports = { addOrder, readOrders };
