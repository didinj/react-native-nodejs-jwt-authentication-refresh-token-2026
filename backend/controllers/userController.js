exports.profile = async (req, res) => {
  res.json({
    success: true,
    message: 'Protected endpoint',

    user: req.user,
  });
};