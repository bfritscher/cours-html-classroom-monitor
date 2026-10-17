module.exports = {
  launch: {
    executablePath: '/usr/bin/google-chrome',
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disk-cache-size=1",
      "--media-cache-size=1",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
    ],
  },
};
