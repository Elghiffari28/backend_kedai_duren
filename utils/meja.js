const db = require("../connect");
const loadMeja = (m) => {
  const sql = "SELECT * FROM meja";
  db.query(sql, (err, results) => {
    if (err) {
      return m(err, null);
    }
    return m(null, results);
  });
};

module.exports = { loadMeja };
