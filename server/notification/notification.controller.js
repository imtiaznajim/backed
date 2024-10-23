const Notification = require("./notification.model");

//import model
const User = require("../user/user.model");

//private key
const admin = require("../../util/privateKey");

//handle user notification true/false
exports.handleNotification = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(200).json({ status: false, message: "User does not found!!", user: {} });

    if (req.body.type === "GeneralNotification") {
      user.notification.GeneralNotification = !user.notification.GeneralNotification;
    }
    if (req.body.type === "NewReleasesMovie") {
      user.notification.NewReleasesMovie = !user.notification.NewReleasesMovie;
    }
    if (req.body.type === "AppUpdate") {
      user.notification.AppUpdate = !user.notification.AppUpdate;
    }
    if (req.body.type === "Subscription") {
      user.notification.Subscription = !user.notification.Subscription;
    }

    await user.save();

    return res.status(200).json({ status: true, message: "Success!", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get notification list
exports.getNotificationList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    const notification = await Notification.find({ userId: user._id }).select("title message image date userId").sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Retrive the notification list by the user!",
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//send Notification by admin
exports.sendNotifications = async (req, res) => {
  try {
    if (req.body.notificationType.trim() === "General Notification") {
      const userId = await User.find({ "notification.GeneralNotification": true }).distinct("_id");

      const userTokens = await User.find({ "notification.GeneralNotification": true }).distinct("fcmToken");
      if (userTokens.length === 0) {
        return res.status(200).json({
          status: false,
          message: "No active users with FCM tokens to send notifications to!",
        });
      }

      if (userTokens.length !== 0) {
        const adminPromise = await admin;

        const payload = {
          tokens: userTokens,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: req.body.image || "",
          },
        };

        adminPromise
          .messaging()
          .sendMulticast(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            await userId.map(async (data) => {
              const notification = new Notification();
              notification.userId = data._id;
              notification.title = req.body.title;
              notification.message = req.body.description;
              notification.image = req.body.image || "";
              notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
              await notification.save();
            });

            return res.status(200).json({
              status: true,
              message: "Successfully sent messages!",
            });
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);

            return res.status(200).json({
              status: false,
              message: "Something went wrong while sending notifications!",
            });
          });
      }
    } else if (req.body.notificationType.trim() === "App Update") {
      const userId = await User.find({ "notification.AppUpdate": true }).distinct("_id");

      const userTokens = await User.find({ "notification.AppUpdate": true }).distinct("fcmToken");
      if (userTokens.length === 0) {
        return res.status(200).json({
          status: false,
          message: "No active users with FCM tokens to send notifications to!",
        });
      }

      if (userTokens.length !== 0) {
        const adminPromise = await admin;

        const payload = {
          tokens: userTokens,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: req.body.image || "",
          },
        };

        adminPromise
          .messaging()
          .sendMulticast(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            await userId.map(async (data) => {
              const notification = new Notification();
              notification.userId = data._id;
              notification.title = req.body.title;
              notification.message = req.body.description;
              notification.image = req.body.image;
              notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
              await notification.save();
            });

            return res.status(200).json({
              status: true,
              message: "Successfully sent messages!",
            });
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);

            return res.status(200).json({
              status: false,
              message: "Something went wrong while sending notifications!",
            });
          });
      }
    } else {
      return res.status(200).json({ status: false, message: "please pass the valid notificationType." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
