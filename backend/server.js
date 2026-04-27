const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { users, discountBills, billDetails, preExpiredGoods, messages } = require('./data/mockData');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.json({ status: 0, message: 'Server is running' });
});

app.post('/doLogin', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      status: 0,
      data: {
        username: user.username,
        store: user.store,
        storeid: user.storeid,
        src: user.src
      }
    });
  } else {
    res.json({
      status: 1,
      message: '用户名或密码错误'
    });
  }
});

app.post('/getDiscountBillsData', (req, res) => {
  const { page, size, barcode, sku, numCompare, curNum, shelfLife, lastShelfLife } = req.body;
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(size) || 50;
  
  let filteredData = [...discountBills];
  
  if (barcode) {
    filteredData = filteredData.filter(item => item.apply_no.includes(barcode));
  }
  
  if (sku) {
    filteredData = filteredData.filter(item => item.hd_shop_code.includes(sku));
  }
  
  if (curNum && numCompare) {
    const num = parseInt(curNum);
    filteredData = filteredData.filter(item => {
      if (numCompare === 1) return item.apply_num > num;
      if (numCompare === 2) return item.apply_num < num;
      if (numCompare === 3) return item.apply_num === num;
      return true;
    });
  }
  
  if (lastShelfLife && shelfLife) {
    const days = parseInt(lastShelfLife);
    filteredData = filteredData.filter(item => {
      const itemDays = parseInt(item.amount) || 0;
      if (shelfLife === 1) return itemDays > days;
      if (shelfLife === 2) return itemDays < days;
      if (shelfLife === 3) return itemDays === days;
      return true;
    });
  }
  
  const totalCount = filteredData.length;
  const totalPage = Math.ceil(totalCount / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  res.json({
    status: 0,
    data: paginatedData,
    current_page: pageNum,
    page_size: pageSize,
    total_count: totalCount,
    total_page: totalPage
  });
});

app.post('/getBillDetails', (req, res) => {
  const { page, size, id } = req.body;
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(size) || 50;
  
  let filteredDetails = [...billDetails];
  
  const totalCount = filteredDetails.length;
  const totalPage = Math.ceil(totalCount / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredDetails.slice(startIndex, endIndex);
  
  let totalNum = 0;
  let totalStockMoney = 0;
  let totalSaleMoney = 0;
  let totalPreMoney = 0;
  
  paginatedData.forEach(item => {
    totalNum += item.apply_num;
    totalStockMoney += parseFloat(item.shop_stock_price) * item.cur_stock;
    totalSaleMoney += parseFloat(item.shop_sale_price) * item.apply_num;
    totalPreMoney += parseFloat(item.pre_price) * item.apply_num;
  });
  
  res.json({
    status: 0,
    data: {
      detail: paginatedData,
      current_page: pageNum,
      page_size: pageSize,
      total_count: totalCount,
      total_page: totalPage,
      total_num: totalNum,
      total_stock_money: totalStockMoney.toFixed(2),
      total_sale_money: totalSaleMoney.toFixed(2),
      total_pre_money: totalPreMoney.toFixed(2)
    }
  });
});

app.post('/getPreExpiredList', (req, res) => {
  const { page, size, barcode, sku, numCompare, curNum, shelfLife, lastShelfLife } = req.body;
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(size) || 50;
  
  let filteredData = [...preExpiredGoods];
  
  if (barcode) {
    filteredData = filteredData.filter(item => item.barcode.includes(barcode));
  }
  
  if (sku) {
    filteredData = filteredData.filter(item => item.sku.includes(sku));
  }
  
  if (curNum && numCompare) {
    const num = parseInt(curNum);
    filteredData = filteredData.filter(item => {
      if (numCompare === 1) return item.stock > num;
      if (numCompare === 2) return item.stock < num;
      if (numCompare === 3) return item.stock === num;
      return true;
    });
  }
  
  if (lastShelfLife && shelfLife) {
    const days = parseInt(lastShelfLife);
    filteredData = filteredData.filter(item => {
      if (shelfLife === 1) return item.last_shelf_life > days;
      if (shelfLife === 2) return item.last_shelf_life < days;
      if (shelfLife === 3) return item.last_shelf_life === days;
      return true;
    });
  }
  
  const totalCount = filteredData.length;
  const totalPage = Math.ceil(totalCount / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  res.json({
    status: 0,
    data: paginatedData,
    current_page: pageNum,
    page_size: pageSize,
    total_count: totalCount,
    total_page: totalPage
  });
});

app.post('/addPreExpired', (req, res) => {
  const { temporaryGoods } = req.body;
  
  if (!temporaryGoods || temporaryGoods.length === 0) {
    return res.json({
      status: 1,
      message: '数据不能为空'
    });
  }
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  temporaryGoods.forEach(item => {
    const newItem = {
      id: uuidv4(),
      barcode: item.barcode || '',
      sku: item.sku || '',
      goods_name: item.goods_name || '',
      hd_shop_code: 'SHOP001',
      produce_date: item.produce_date || dateStr,
      expiry_date: item.expiry_date || dateStr,
      shelf_life: item.shelf_life || 365,
      last_shelf_life: item.last_shelf_life || 30,
      stock: item.currentNumber || 0,
      created_at: dateStr,
      updated_at: dateStr
    };
    preExpiredGoods.unshift(newItem);
  });
  
  res.json({
    status: 0,
    message: '添加成功'
  });
});

app.post('/editPreExpired', (req, res) => {
  const { temporaryGoods } = req.body;
  
  if (!temporaryGoods || temporaryGoods.length === 0) {
    return res.json({
      status: 1,
      message: '数据不能为空'
    });
  }
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  temporaryGoods.forEach(item => {
    const index = preExpiredGoods.findIndex(g => g.id === item.id);
    if (index !== -1) {
      preExpiredGoods[index] = {
        ...preExpiredGoods[index],
        barcode: item.barcode || preExpiredGoods[index].barcode,
        sku: item.sku || preExpiredGoods[index].sku,
        goods_name: item.goods_name || preExpiredGoods[index].goods_name,
        produce_date: item.produce_date || preExpiredGoods[index].produce_date,
        expiry_date: item.expiry_date || preExpiredGoods[index].expiry_date,
        shelf_life: item.shelf_life || preExpiredGoods[index].shelf_life,
        last_shelf_life: item.last_shelf_life || preExpiredGoods[index].last_shelf_life,
        stock: item.currentNumber || preExpiredGoods[index].stock,
        updated_at: dateStr
      };
    }
  });
  
  res.json({
    status: 0,
    message: '编辑成功'
  });
});

app.post('/deletePreExpired', (req, res) => {
  const { ids } = req.body;
  
  if (!ids || ids.length === 0) {
    return res.json({
      status: 1,
      message: '请选择要删除的数据'
    });
  }
  
  ids.forEach(id => {
    const index = preExpiredGoods.findIndex(item => item.id === id);
    if (index !== -1) {
      preExpiredGoods.splice(index, 1);
    }
  });
  
  res.json({
    status: 0,
    message: '删除成功'
  });
});

app.get('/message', (req, res) => {
  res.json({
    status: 0,
    data: messages.slice(-50)
  });
});

app.post('/file/uploadimg', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({
      status: 1,
      message: '上传失败'
    });
  }
  
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  
  res.json({
    status: 0,
    data: {
      url: fileUrl,
      name: req.file.originalname
    }
  });
});

const globalUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.emit('aaa', '测试');
  
  socket.on('message', (obj) => {
    const mess = {
      username: obj.username,
      store: obj.store,
      storeid: obj.storeid,
      src: obj.src,
      msg: obj.msg,
      img: obj.img,
      roomid: obj.roomid,
      time: obj.time
    };
    io.to(mess.roomid).emit('message', mess);
    messages.push(mess);
    console.log(obj.username + '说：' + mess.msg);
  });
  
  socket.on('enter', (obj) => {
    socket.name = obj.name;
    socket.room = obj.roomid;
    
    if (!(obj.roomid in globalUsers)) {
      globalUsers[obj.roomid] = {};
    }
    globalUsers[obj.roomid][obj.name] = obj;
    
    socket.join(obj.roomid);
    
    io.to(obj.roomid).emit('enter', {
      users: globalUsers[obj.roomid],
      name: obj.name,
      store: obj.store
    });
    
    console.log(obj.name + '加入了' + obj.roomid);
  });
  
  socket.on('out', (obj) => {
    if (globalUsers[obj.roomid] && globalUsers[obj.roomid][obj.name]) {
      delete globalUsers[obj.roomid][obj.name];
    }
    
    console.log(obj.name + '退出了' + obj.roomid);
    
    io.to(obj.roomid).emit('out', {
      users: globalUsers[obj.roomid] || {},
      name: obj.name,
      store: obj.store
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.room && socket.name && globalUsers[socket.room]) {
      delete globalUsers[socket.room][socket.name];
      
      io.to(socket.room).emit('out', {
        users: globalUsers[socket.room] || {},
        name: socket.name
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket is running on ws://localhost:${PORT}`);
});
