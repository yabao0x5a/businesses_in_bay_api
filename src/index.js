const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const yelpApiKey = process.env.REACT_APP_YELP_API_KEY;
const yelpApiKey = `rw2Ya9lwEheCXk1C7d_VD7rmpUGrchM6k91Nw8j1t5FU-gsz9Gd9G9igbYUse5SIPhEyDPKuVFUvStp8ctlVQLLS3ytHcOSKSvzWh_wbQHlFu9VUSoOhAEkhnJgYZXYx`;

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

app.get("/api/businesses/:businessId", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
