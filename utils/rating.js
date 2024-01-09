const db = require("../connect");
const loadRatings = (r) => {
  const sql = "SELECT * FROM ratings";
  db.query(sql, (err, results) => {
    if (err) {
      return r(err, null);
    }

    let total = 0;
    results.forEach((r) => {
      total += r.rating;
    });
    const count = results.length;
    const rataRata = total / count;
    const fixRatarata = rataRata.toFixed(1);
    // console.log(rataRata);
    r(null, fixRatarata);
  });
};

module.exports = { loadRatings };
