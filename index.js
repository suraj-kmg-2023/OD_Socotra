import express from "express";
const app = express();
const port = process.env.PORT || 3000;

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "up",
    timestamp: new Date().toISOString(),
  });
});

app.get("/getPolicyDetails", async (req, res) => {
  res.status(200).json({
    successful: true,
    output_data: {
      attributes: {
        premium: "2500",
      },
    },
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
