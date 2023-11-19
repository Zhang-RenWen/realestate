var express = require("express");
const app = express();
var router = express.Router();

const mysql = require("mysql2");

//create connection to database
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DB,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Middleware for permission check
const checkPermission = (req, res, next) => {
  // 在此添加權限檢查邏輯，這裡只是示範
  const hasPermission = true; /* 檢查用戶權限的邏輯 */
  if (hasPermission) {
    next(); // 允許進入下一個 middleware 或路由處理
  } else {
    res.status(403).json({ error: "Permission denied" });
  }
};

// Get all items
router.get("/items", (req, res) => {
  db.query("SELECT * FROM REAL_ESTATE_ITEMS", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});
// Get a specific item by ID
router.get("/items/:uuid", checkPermission, (req, res) => {
  const itemId = req.params.uuid;
  db.query(
    "SELECT * FROM REAL_ESTATE_ITEMS WHERE UUID = ?",
    itemId,
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "item not found" });
        return;
      }
      res.json(results[0]);
    }
  );
});
// Create a new item
app.post("add/item", checkPermission, (req, res) => {
  const newItem = req.body;
  db.query("INSERT INTO REAL_ESTATE_ITEMS SET ?", newItem, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(result);
    res.status(200).json(result);
  });
});

// Update a item by ID
app.put("/items/:id", checkPermission, (req, res) => {
  const itemId = req.params.uuid;
  const updatedItem = req.body;
  db.query(
    "UPDATE REAL_ESTATE_ITEMS SET ? WHERE UUID = ?",
    [updatedItem, itemId],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Item updated successfully" });
    }
  );
});

// Delete a user by ID
router.delete("/items/:id", checkPermission, (req, res) => {
  const itemId = req.params.id;
  db.query("DELETE FROM REAL_ESTATE_ITEMS WHERE UUID = ?", itemId, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Item deleted successfully" });
  });
});

module.exports = router;
