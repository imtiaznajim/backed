const Region = require("./region.model");

//fs
const fs = require("fs");

//axios
const axios = require("axios");

//create region from TMDB database
exports.getStore = async (req, res) => {
  try {
    await axios
      .get("https://api.themoviedb.org/3/configuration/countries?api_key=67af5e631dcbb4d0981b06996fcd47bc")
      .then(async (res) => {
        await res.data.map(async (data) => {
          const region = new Region();
          region.name = data.english_name.toUpperCase().trim();
          region.uniqueID = data.iso_3166_1;
          await region.save();
        });
      })
      .catch((error) => console.log(error));
    return res.status(200).json({ status: true, message: "Region Imported Successfully!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//create region
exports.store = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const region = await Region.find({ name: req.body.name.toUpperCase().trim() });

    if (region.length === 0) {
      const region = new Region();
      region.name = req.body.name.toUpperCase().trim();
      await region.save();

      return res.status(200).json({
        status: true,
        message: "Success",
        region,
      });
    } else {
      return res.status(200).json({ status: false, message: "This region already exists." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//update region
exports.update = async (req, res) => {
  try {
    if (!req.query.regionId) {
      return res.status(200).json({ status: false, message: "regionId is required!!" });
    }

    const region_ = await Region.find({ name: req.query.name.toUpperCase().trim() });

    const region = await Region.findById(req.query.regionId);
    if (!region) {
      return res.status(200).json({ status: false, message: "Region does not found." });
    }

    if (region_.length === 0) {
      region.name = req.query.name.toUpperCase().trim();
      await region.save();

      return res.status(200).json({
        status: true,
        message: "Success",
        region,
      });
    } else {
      return res.status(200).json({ status: false, message: "Region already exists." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//delete region
exports.destroy = async (req, res) => {
  try {
    if (!req.query.regionId) {
      return res.status(200).json({ status: false, message: "Region Id is required!!" });
    }

    const region = await Region.findById(req.query.regionId);

    if (!region) {
      return res.status(200).json({ status: false, message: "Region does not found!!" });
    }

    if (req.file) {
      const deleteImage = region.image.split("storage");

      if (deleteImage) {
        if (fs.existsSync("storage" + deleteImage[0])) {
          fs.unlinkSync("storage" + deleteImage[0]);
        }
      }
    }

    await region.deleteOne();

    return res.status(200).json({ status: true, message: "Delete Successful ✔" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get region
exports.get = async (req, res) => {
  try {
    const region = await Region.find().sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success", region });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};
