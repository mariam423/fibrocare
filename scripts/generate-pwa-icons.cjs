const sharp = require("sharp");
const path = require("path");

const root = path.join(__dirname, "..", "public", "icons");

const jobs = [
  { src: "fibrocare-icon.svg", out: "icon-192x192.png", size: 192 },
  { src: "fibrocare-icon.svg", out: "icon-512x512.png", size: 512 },
  { src: "fibrocare-maskable.svg", out: "maskable-512x512.png", size: 512 },
  { src: "fibrocare-icon.svg", out: "apple-touch-icon.png", size: 180 },
];

(async () => {
  for (const job of jobs) {
    await sharp(path.join(root, job.src))
      .resize(job.size, job.size)
      .png()
      .toFile(path.join(root, job.out));
    console.log("wrote", job.out);
  }
})();