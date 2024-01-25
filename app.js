const express = require("express");
const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const response = require("./response");
const db = require("./connect");
const { loadMenu, storage, deleteFile } = require("./utils/menu");
const { loadMeja } = require("./utils/meja");
const { loadPesanan, formatDate } = require("./utils/pesan");
const { loadRatings } = require("./utils/rating");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(expressLayouts);
// app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// konfiggurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
// app.use(cors());

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/images/"); // Simpan file di folder 'public/images'
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  loadRatings((err, average) => {
    if (err) {
      throw err;
    }
    console.log(average);
    res.render("beranda", {
      layout: "layouts/main",
      title: "Beranda",
      average,
      url: req.protocol + "://" + req.headers.host,
    });
  });
});

app.get("/menu", (req, res) => {
  loadMenu((err, results) => {
    if (err) {
      throw err;
    }
    res.render("menu", {
      layout: "layouts/main",
      title: "Daftar Menu",
      results,
      img_path: "/images/",
      url: req.protocol + "://" + req.headers.host,
      msg: req.flash("msg"),
      updtMsg: req.flash("updtMsg"),
      delMsg: req.flash("delMsg"),
    });
  });
});

app.get("/meja", (req, res) => {
  loadMeja((err, results) => {
    if (err) {
      throw err;
    }
    res.render("meja", {
      layout: "layouts/main",
      title: "Daftar Meja",
      results,
      url: req.protocol + "://" + req.headers.host,
      msg: req.flash("msg"),
      updtMsg: req.flash("updtMsg"),
      delMsg: req.flash("delMsg"),
    });
  });
});

app.get("/pesan", (req, res) => {
  loadPesanan((err, results) => {
    if (err) {
      throw err;
    }
    res.render("pesanan", {
      layout: "layouts/main",
      title: "Daftar Pesanan",
      results,
      formatDate,
      url: req.protocol + "://" + req.headers.host,
    });
  });
});

// form tambah menu
app.get("/menu/add", (req, res) => {
  res.render("add-menu", {
    layout: "layouts/main",
    title: "Tambah Menu",
    img_path: "/images",
    url: req.protocol + "://" + req.headers.host,
  });
});

// form tambah meja
app.get("/meja/add", (req, res) => {
  res.render("add-meja", {
    layout: "layouts/main",
    title: "Tambah Meja",
    url: req.protocol + "://" + req.headers.host,
  });
});

// form ubah menu
app.get("/menu/edit/:kode", (req, res) => {
  const kodeMenu = req.params.kode;
  console.log(kodeMenu);
  const sql = "SELECT * FROM menu WHERE kode = ?";
  db.query(sql, [kodeMenu], (err, results) => {
    if (err) {
      throw err;
    }
    res.render("edit-menu1", {
      layout: "layouts/main",
      title: "Ubah Menu",
      results,
      img_path: "/images",
      url: req.protocol + "://" + req.headers.host,
    });
  });
});

// form edit meja
app.get("/meja/edit/:id_meja", (req, res) => {
  const idMeja = req.params.id_meja;
  console.log(idMeja);
  const sql = "SELECT * FROM meja WHERE id_meja = ?";
  db.query(sql, [idMeja], (err, results) => {
    if (err) {
      throw err;
    }
    res.render("edit-meja", {
      layout: "layouts/main",
      title: "Ubah Meja",
      results,
      url: req.protocol + "://" + req.headers.host,
    });
  });
});

// route API ALL MENU
app.get("/api_menu", (req, res) => {
  loadMenu((err, results) => {
    if (err) {
      throw err;
    }
    const menuImages = results.map((menuItem) => ({
      ...menuItem,
      imageURL: `${req.protocol}://${req.get("host")}/images/${
        menuItem.gambar
      }`,
    }));
    response(200, menuImages, "Mengambil semua data menu", res);
  });
});

// route get All Meja
app.get("/api_meja", (req, res) => {
  loadMeja((err, results) => {
    if (err) {
      throw err;
    }
    response(200, results, "Mengambil Semua data meja", res);
  });
});

// app.get("/menu/:kategori", (req, res) => {
//   const kategori = req.params.kategori;
//   const sql = `SELECT * FROM menu WHERE kategori = '${kategori}'`;
//   db.query(sql, (err, results) => {
//     if (results.length > 0) {
//       if (err) {
//         throw err;
//       }
//       response(200, results, `Mengambil semua data menu ${kategori}`, res);
//     } else {
//       response(404, results, `Maaf kategori yang anda cari tidak ada!!`, res);
//     }
//   });
// });

// route add Menu
app.post("/menu", upload.single("gambar"), (req, res) => {
  const { nama_menu, deskripsi, kategori, harga } = req.body;
  console.log({ nama_menu, deskripsi, kategori, harga });
  const gambar = req.file.filename;
  const sql = `INSERT INTO menu ( nama_menu, deskripsi, kategori, harga, gambar) VALUES ( ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [nama_menu, deskripsi, kategori, harga, gambar],
    (err, results) => {
      if (err) response(500, "Invalid", "Error", res);
      console.log(results);
      if (results?.affectedRows) {
        const data = {
          isSuccess: results.affectedRows,
          id: results.insertId,
        };
        // response(200, data, "Data berhasil ditambahkan", res);
        req.flash("msg", "Menu berhasil ditambahkan!");
        res.redirect("/menu");
      } else {
        console.log("Data gagal dimasukan");
      }
    }
  );
});

// Route Update Menu
app.post("/menu/:kode", upload.single("gambar"), (req, res) => {
  // batas Error
  let new_gambar = "";
  let old_gambar = "";
  if (req.file) {
    new_gambar = req.file.filename;
    if (req.body.old_gambar) {
      try {
        fs.unlinkSync("./public/images/" + req.body.old_gambar);
        console.log("File lama dihapus");
      } catch (err) {
        console.error("Gagal menghapus file lama:", err);
      }
    }
  } else {
    new_gambar = req.body.old_gambar;
    old_gambar = req.body.old_gambar;
  }
  console.log(new_gambar, old_gambar);
  // batas Error
  const { nama_menu, deskripsi, kategori, harga, kode } = req.body;
  // const gambar = req.file.filename;

  console.log({ nama_menu, deskripsi, kategori, harga, kode });
  const sql = `UPDATE menu SET nama_menu = '${nama_menu}', deskripsi = '${deskripsi}', kategori = '${kategori}', harga = ${harga}, gambar= '${new_gambar}' WHERE kode = '${kode}'`;
  db.query(sql, (err, results) => {
    if (err) response(500, results, "Error", res);
    if (results?.affectedRows) {
      const data = {
        isSuccess: results.affectedRows,
        message: results.message,
      };
      req.flash("updtMsg", "Menu berhasil diubah!");
      res.redirect("/menu");
      // response(200, data, "Data berhasil diubah", res);
    } else {
      console.log("Data gagal diubah");
    }
  });
});

// route tambah meja
app.post("/meja", (req, res) => {
  const { no_meja, kapasitas, deskripsi } = req.body;
  const sql = `INSERT INTO meja (no_meja, kapasitas, deskripsi) VALUES (?, ?, ?)`;
  db.query(sql, [no_meja, kapasitas, deskripsi], (err, results) => {
    console.log(err);
    if (err) response(500, results, "Error", res);
    if (results?.affectedRows) {
      const data = {
        isSuccess: results.affectedRows,
        message: results.message,
      };
      // response(200, data, "Data berhasil ditambahkan", res);
      req.flash("msg", "Meja berhasil ditambahkan!");
      res.redirect("/meja");
      // res.redirect("http://localhost:3000/beranda");
    } else {
      console.log("data gagal dimasukan");
    }
  });
});

// route ubah meja
app.post("/meja/:id_meja", (req, res) => {
  const { no_meja, kapasitas, deskripsi, status, id_meja } = req.body;
  const idMeja = parseInt(id_meja);
  console.log({ no_meja, kapasitas, deskripsi, status, id_meja });
  console.log(id_meja);
  const sql = `UPDATE meja SET no_meja = '${no_meja}', kapasitas = ${kapasitas}, deskripsi = '${deskripsi}', status = ${status} WHERE id_meja = ${id_meja}`;
  db.query(sql, (err, results) => {
    console.log(results);
    console.log(err);
    if (err) response(500, results, "Error", res);
    if (results?.affectedRows) {
      const data = {
        isSuccess: results.affectedRows,
        message: results.message,
      };
      // response(200, data, "Data berhasil diubah", res);
      req.flash("updtMsg", "Meja berhasil diubah!");
      res.redirect("/meja");
    } else {
      console.log("Data Tidak Ditemukan");
    }
  });
});

app.post("/rating", (req, res) => {
  const { rating } = req.body;
  const sql = "INSERT INTO ratings (rating) VALUES (?)";

  console.log(rating);

  db.query(sql, [rating], (err, results) => {
    if (err) {
      throw err;
    }
    if (results?.affectedRows) {
      const data = {
        isSuccess: results.affectedRows,
        message: results.message,
      };
      console.log(data);
    } else {
      console.log("Error memasukan data");
    }
  });
});

app.post("/proses_pemesanan", (req, res) => {
  console.log(req.body);
  const { nama, nohp, jumlah_tamu, tanggal, jam, id_meja, catatan } = req.body;
  console.log([nama, nohp, jumlah_tamu, tanggal, jam, id_meja, catatan]);
  const sqlCheckAvailability = `SELECT * FROM pemesan WHERE tanggal = ? AND jam = ? AND id_meja = ?`;
  db.query(
    sqlCheckAvailability,
    [tanggal, jam, id_meja],
    (errCheck, resultsCheck) => {
      if (errCheck) {
        response(500, errCheck, "Database error", res);
        console.log(errCheck);
        return;
      }
      console.log(resultsCheck);

      if (resultsCheck.length === 0) {
        const sql = `INSERT INTO pemesan (nama, nohp, jumlah_tamu, tanggal, jam, id_meja, no_meja, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(
          sql,
          [nama, nohp, jumlah_tamu, tanggal, jam, id_meja, id_meja, catatan],
          (err, results) => {
            console.log(err, results);
            if (err) response(500, results, "Error", res);
            if (results?.affectedRows) {
              const sqlUpdate = `UPDATE meja SET status = 0 WHERE no_meja = '${id_meja}'`;
              db.query(sqlUpdate, (errUpdate, resultUpdate) => {
                console.log(errUpdate);
                if (errUpdate) {
                  response(
                    500,
                    errUpdate,
                    "Error saat mengubah status meja",
                    res
                  );
                }
              });
              const data = {
                isSuccess: results.affectedRows,
                message: results.message,
              };
              console.log(data);
              req.flash("msg", "Pesanan dibuat!");
              response(
                200,
                data,
                "Pemesanan berhasil ditambahkan dan status meja behasil diubah",
                res
              );
              // res.redirect("http://localhost:3000/beranda");
            } else {
              console.log("data gagal dimasukan");
            }
          }
        );
      } else {
        console.log("Meja sudah dipesan");
      }
    }
  );
});

app.get("/ubah-status-meja/:id_meja", (req, res) => {
  const idMeja = req.params.id_meja;
  console.log(idMeja);
  // Ambil status meja dari database
  const getStatusQuery = `SELECT status FROM meja WHERE id_meja = ${idMeja}`;
  db.query(getStatusQuery, (err, results) => {
    if (err) {
      return response(500, results, "Error", res);
    }

    if (results.length > 0) {
      // Dapatkan status meja saat ini
      const currentStatus = results[0].status;
      // Ubah status menjadi kebalikannya
      const newStatus = currentStatus === 1 ? 0 : 1;

      const updateStatusQuery = `UPDATE meja SET status = ${newStatus} WHERE id_meja = ${idMeja}`;
      db.query(updateStatusQuery, (updateErr, updateResults) => {
        if (updateErr) {
          return response(
            500,
            updateErr,
            "Error saat mengubah status meja",
            res
          );
        }

        if (updateResults?.affectedRows) {
          console.log("Berhasil mengganti status meja");
          // Mengembalikan pesan berhasil atau kode status lain jika diperlukan
          // return res.status(200).send("Status meja berhasil diubah");
          req.flash("msg", "Status meja berhasil dirubah");
          return res.redirect("/meja");
        } else {
          console.log("Data tidak ditemukan");
          return response(404, null, "Data tidak ditemukan", res);
        }
      });
    } else {
      console.log("Data tidak ditemukan");
      return response(404, null, "Data tidak ditemukan", res);
    }
  });
});

app.get("/selesai-pesanan/:id_meja", (req, res) => {
  const idMeja = req.params.id_meja;
  const sql = `UPDATE meja SET status = 1 WHERE id_meja = ${idMeja}`;
  db.query(sql, (err, results) => {
    if (err) response(500, results, "Error mengubah status", res);
    if (results?.affectedRows) {
      console.log("berhasil mengubah status meja");
      req.flash("msg", `Pesanan selesai!`);
      res.redirect("/pesan");
    } else {
      response(404, null, "data tidak ditemukan", res);
    }
  });
});

// app.get("/ubah-status-meja/:id_meja", (req, res) => {
//   const idMeja = req.params.id_meja;
//   const sql = `UPDATE meja SET status = 1 WHERE id_meja = ${idMeja}`;
//   db.query(sql, (err, results) => {
//     if (err) response(500, results, "Error", res);
//     if (results?.affectedRows) {
//       console.log("berhasil mengganti status meja");
//     } else {
//       console.log("data tidak ditemukan");
//     }
//   });
// });

app.get("/menu/delete/:kode", (req, res) => {
  const kode = req.params.kode;
  db.query(`SELECT gambar FROM menu WHERE kode = "${kode}"`, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error mengambil data dari database" });
    } else {
      if (results.length > 0) {
        const filePath = "public/images/" + results[0].gambar; // Ganti dengan path yang sesuai

        // Query untuk menghapus data dari database berdasarkan kode
        db.query(
          `DELETE FROM menu WHERE kode = '${kode}'`,
          (err, deleteResult) => {
            if (err) {
              res
                .status(500)
                .json({ message: "Error menghapus data dari database" });
            } else {
              if (deleteResult.affectedRows > 0) {
                // Hapus file dari sistem file jika data berhasil dihapus dari database
                deleteFile(filePath);
                req.flash("delMsg", "Menu berhasil dihapus!");
                res.redirect("/menu");
              } else {
                res.status(404).json({ message: "Data tidak ditemukan" });
              }
            }
          }
        );
      } else {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
    }
  });
  // Query untuk mengambil informasi nama file dari database berdasarkan kode
});

app.get("/meja/delete/:id_meja", (req, res) => {
  const id_meja = req.params.id_meja;
  console.log(id_meja);
  db.query(
    `DELETE FROM meja WHERE id_meja = '${id_meja}'`,
    (err, deleteResult) => {
      console.log(deleteResult);
      if (err) {
        res.status(500).json({ mesaage: "Error menghapus data" });
      } else {
        if (deleteResult.affectedRows > 0) {
          req.flash("delMsg", "Meja berhasil dihapus!");
          res.redirect("/meja");
        } else {
          res.status(404).json({ message: "Data tidak ditemukan" });
        }
      }
    }
  );
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.listen(port, () => {
  console.log(`Listen on port ${port}`);
});
