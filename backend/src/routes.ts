import express from "express";
import path from "path";

const routes = express.Router();

// favicon
routes.get("/favicon.ico", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "public", "assets", "images", "favicon.ico")
  );
});

export default routes;
