const db = require("../connect");
const loadPesanan = (m) => {
  const sql = "SELECT * FROM pemesan ORDER BY tanggal DESC";
  db.query(sql, (err, results) => {
    if (err) {
      return m(err, null);
    }
    return m(null, results);
  });
};

const formatDate = (tanggal) => {
  const date = new Date(tanggal);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("id-ID", options);
};

module.exports = { loadPesanan, formatDate };
