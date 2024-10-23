const Stream = require("../stream/stream.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//create channel by admin if isIptvAPI switch on (true)
exports.Store = async (req, res) => {
  try {
    if (req.body.channelId && req.body.channelName && req.body.country && req.body.streamURL && req.body.channelLogo) {
      const channelExist = await Stream.findOne({ channelId: req.body.channelId });
      if (channelExist) {
        return res.status(200).json({
          status: false,
          message: "This Channel already exists! ",
        });
      }

      const stream = new Stream();
      stream.streamURL = req.body.streamURL;
      stream.channelId = req.body.channelId;
      stream.channelName = req.body.channelName;
      stream.country = req.body.country;
      stream.channelLogo = req.body.channelLogo;
      await stream.save();

      return res.status(200).json({
        status: true,
        message: "Channel Created!",
        stream,
      });
    } else {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//create manual channel by admin
exports.manualStore = async (req, res) => {
  try {
    if (!req.body.channelName || !req.body.country || !req.body.streamURL || !req.body.channelLogo) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const stream = new Stream();
    stream.streamURL = req.body.streamURL;
    stream.channelName = req.body.channelName;
    stream.country = req.body.country;
    stream.channelLogo = req.body.channelLogo;
    await stream.save();

    return res.status(200).json({
      status: true,
      message: "Channel Created by admin!",
      stream,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//get channel related data added by admin if isIptvAPI switch on (true)
exports.get = async (req, res) => {
  try {
    const stream = await Stream.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "All liveTV related data has been get added by Admin!",
      stream,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//update channel
exports.update = async (req, res) => {
  try {
    const stream = await Stream.findById(req.query.streamId);
    if (!stream) {
      return res.status(200).json({ status: false, message: "Stream does not found!!" });
    }

    stream.streamURL = req.body.streamURL ? req.body.streamURL : stream.streamURL;
    stream.channelId = req.body.channelId ? req.body.channelId : stream.channelId;
    stream.channelName = req.body.channelName ? req.body.channelName : stream.channelName;
    stream.country = req.body.country ? req.body.country : stream.country;

    if (req.body.channelLogo) {
      //delete the old channelLogo from digitalOcean Spaces
      const urlParts = stream.channelLogo.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      stream.channelLogo = req.body.channelLogo ? req.body.channelLogo : stream.channelLogo;
    }

    await stream.save();

    return res.status(200).json({
      status: true,
      message: "Channel Updated by admin!",
      stream,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete channel
exports.destroy = async (req, res) => {
  try {
    if (!req.query.streamId) {
      return res.status(200).json({ status: false, message: "streamId is required!!" });
    }

    const stream = await Stream.findById(req.query.streamId);
    if (!stream) {
      return res.status(200).json({ status: false, message: "Stream does not found!!" });
    }

    if (stream.channelLogo) {
      //delete the old channelLogo from digitalOcean Spaces
      const urlParts = stream.channelLogo.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    await stream.deleteOne();

    return res.status(200).json({ status: true, message: "Channel deleted by admin!!" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};
