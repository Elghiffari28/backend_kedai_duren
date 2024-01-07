const db = require("../connect");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const loadMenu = (callback) => {
  const sql = "SELECT * FROM menu";
  db.query(sql, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, results);
  });
};

const addMenu = (callback) => {
  const { kode, nama_menu, deskripsi, kategori, harga, gambar } = req.body;
  const sql = `INSERT INTO menu (kode, nama_menu, deskripsi, kategori, harga, gambar) VALUES ('${kode}', '${nama_menu}', '${deskripsi}', '${kategori}', ${harga}, '${gambar}')`;
  db.query(sql, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, results);
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/"); // Simpan file di folder 'public/images'
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Gagal menghapus data:", err);
    } else {
      console.log("Data berhasil dihapus");
    }
  });
};
module.exports = { loadMenu, addMenu, storage, deleteFile };
