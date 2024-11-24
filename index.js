const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const cluster = require("cluster");
const os = require("os");

dotenv.config();
const PORT = process.env.PORT || 5000;

// Get the number of available CPU cores
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  // If this is the master process, fork worker processes
  console.log(`Master process is running with PID: ${process.pid}`);

  // Fork workers based on available CPUs
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();  // Fork a worker
  }

  // Listen for worker deaths and restart them if they die
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Fork a new worker in case a worker dies
    cluster.fork();
  });
} else {
  // This is the worker process. Set up the Express app here.
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // MongoDB connection
  mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error(err));

  // Routes
  const productRoutes = require("./routes/products");
  const authRoutes = require("./routes/auth");

  app.use("/api/products", productRoutes);
  app.use("/api/auth", authRoutes);

  // Start the server (each worker handles this)
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is running on port ${PORT}`);
  });
}
