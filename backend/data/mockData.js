const { v4: uuidv4 } = require('uuid');

let users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    store: '总部',
    storeid: '001',
    src: ''
  },
  {
    id: 2,
    username: 'user1',
    password: '123456',
    store: '门店A',
    storeid: '002',
    src: ''
  }
];

let discountBills = [];
let billDetails = [];
let preExpiredGoods = [];
let messages = [];

function initMockData() {
  for (let i = 1; i <= 50; i++) {
    discountBills.push({
      id: i,
      apply_no: `APPLY${String(i).padStart(6, '0')}`,
      hd_shop_code: `SHOP${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
      apply_num: Math.floor(Math.random() * 100) + 10,
      amount: (Math.random() * 10000 + 1000).toFixed(2),
      begin_date: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      end_date: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      created_at: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      realname: `用户${i}`,
      updated_at: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      audit_status: i % 3 === 0 ? '已审核' : '待审核',
      isChecked: false
    });
  }

  for (let i = 1; i <= 30; i++) {
    billDetails.push({
      id: i,
      barcode: `BAR${String(i).padStart(10, '0')}`,
      goods_name: `商品${i}`,
      produce_date: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      expiry_date: `2025-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      durability_days: Math.floor(Math.random() * 365) + 30,
      remain_durability_days: Math.floor(Math.random() * 90) + 10,
      cur_stock: Math.floor(Math.random() * 100) + 1,
      apply_num: Math.floor(Math.random() * 50) + 1,
      shop_stock_price: (Math.random() * 100 + 10).toFixed(2),
      shop_sale_price: (Math.random() * 200 + 20).toFixed(2),
      pre_price: (Math.random() * 50 + 5).toFixed(2),
      check_num: null,
      check_price: null
    });
  }

  for (let i = 1; i <= 40; i++) {
    preExpiredGoods.push({
      id: uuidv4(),
      barcode: `BAR${String(i).padStart(10, '0')}`,
      sku: `SKU${String(i).padStart(8, '0')}`,
      goods_name: `临期商品${i}`,
      hd_shop_code: `SHOP${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
      produce_date: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      expiry_date: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      shelf_life: Math.floor(Math.random() * 365) + 30,
      last_shelf_life: Math.floor(Math.random() * 30) + 1,
      stock: Math.floor(Math.random() * 100) + 1,
      created_at: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      updated_at: `2024-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    });
  }
}

initMockData();

module.exports = {
  users,
  discountBills,
  billDetails,
  preExpiredGoods,
  messages
};
