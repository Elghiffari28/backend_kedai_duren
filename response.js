const response = (statusCode, data, message, res) => {
  res.json({
    status: statusCode,
    payload: {
      data,
      message,
    },
    metadata: {
      prev: "",
      next: "",
      cureent: "",
    },
  });
};

module.exports = response;
