const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// const pool = new Pool({
//   user: "hqugikqrtjkegi",
//   host: "ec2-52-45-200-167.compute-1.amazonaws.com",
//   database: "d2mrhpp8mj639a",
//   password: "cb8858680683862a5cd3ed175cdcb02d6a3ee7e4cf25230590d708d2fc2821cc",
//   port: 5432, // Default PostgreSQL port
// });
const dbUri =
  "postgres://jngxdfcymfqjnm:c7e6da8af9ac77ffd89bd7a2a88b9bf79452c68795ee4c218b84a9a7be3a3473@ec2-3-212-29-93.compute-1.amazonaws.com:5432/d7t93d89iucfkh";
// PostgreSQL database configuration
const pool = new Pool({
  connectionString: dbUri,
  ssl: {
    rejectUnauthorized: false, // For development purposes only; should be handled differently in production
  },
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const yelpApiKey = process.env.REACT_APP_YELP_API_KEY;
const yelpApiKey = `Wp7bthX77oh-tGKNUXFY7YdfDUcF38mLLupN6w7YSF8M47sdJ475DYmsTVortzUQs2fkL8dftIKofDH8qVUFPwH3UFNhAwTLMYxTXZ2mWiN4FNa51QNS6yLWQnUaZXYx`;

app.get("/api/businesses/:cityName", async (req, res) => {
  const { cityName } = req.params;
  try {
    const response = await axios.get(
      `https://api.yelp.com/v3/businesses/search?location=${cityName}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${yelpApiKey}`,
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/businesses/:businessId/details", async (req, res) => {
  const { businessId } = req.params;
  try {
    const response = await axios.get(
      `https://api.yelp.com/v3/businesses/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${yelpApiKey}`,
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/businesses/:businessId/reviews", async (req, res) => {
  const { businessId } = req.params;
  try {
    const response = await axios.get(
      `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${yelpApiKey}`,
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get liked businesses
app.get("/api/liked-businesses", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM businesses_likes");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching liked businesses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Like a business
app.post("/api/liked-businesses/like", async (req, res) => {
  const { business_id } = req.body;

  try {
    // Check if the business_id exists in the table
    const existingBusiness = await pool.query(
      "SELECT * FROM businesses_likes WHERE business_id = $1",
      [business_id],
    );

    if (existingBusiness.rows.length === 0) {
      // If business_id does not exist, insert a new row
      const { rows } = await pool.query(
        "INSERT INTO businesses_likes (business_id, liked_count, updated_at) VALUES ($1, 1, NOW()) RETURNING *",
        [business_id],
      );
      res.json(rows[0]);
    } else {
      // If business_id exists, update the existing row
      const { rows } = await pool.query(
        "UPDATE businesses_likes SET liked_count = liked_count + 1, updated_at = NOW() WHERE business_id = $1 RETURNING *",
        [business_id],
      );
      res.json(rows[0]);
    }
  } catch (error) {
    console.error("Error liking a business:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Unlike a business
app.post("/api/liked-businesses/unlike", async (req, res) => {
  const { business_id } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE businesses_likes SET liked_count = businesses_likes.liked_count - 1, updated_at = NOW() WHERE business_id = $1 RETURNING *",
      [business_id],
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Error unliking a business:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
