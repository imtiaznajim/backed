const PremiumPlan = require("./premiumPlan.model");

//import model
const User = require("../user/user.model");
const PremiumPlanHistory = require("./premiumPlanHistory.model");

//google play
const Verifier = require("google-play-billing-validator");

//notification
const Notification = require("../notification/notification.model");

//private key
const admin = require("../../util/privateKey");

//create PremiumPlan
exports.store = async (req, res) => {
  try {
    if (!req.body.validity || !req.body.validityType || !req.body.dollar || !req.body.productKey || !req.body.planBenefit)
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const premiumPlan = new PremiumPlan();

    premiumPlan.name = req.body.name;
    premiumPlan.validity = req.body.validity;
    premiumPlan.validityType = req.body.validityType;
    premiumPlan.dollar = req.body.dollar;
    premiumPlan.tag = req.body.tag;
    premiumPlan.productKey = req.body.productKey;
    premiumPlan.planBenefit = req.body.planBenefit.split(",");

    await premiumPlan.save();

    return res.status(200).json({ status: true, message: "Success!!", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update PremiumPlan
exports.update = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.findById(req.query.premiumPlanId);

    if (!premiumPlan) {
      return res.status(200).json({ status: false, message: "premiumPlan does not found!!" });
    }

    premiumPlan.name = req.body.name ? req.body.name : premiumPlan.name;
    premiumPlan.validity = req.body.validity ? req.body.validity : premiumPlan.validity;
    premiumPlan.validityType = req.body.validityType ? req.body.validityType : premiumPlan.validityType;
    premiumPlan.dollar = req.body.dollar ? req.body.dollar : premiumPlan.dollar;
    premiumPlan.tag = req.body.tag ? req.body.tag : premiumPlan.tag;
    premiumPlan.productKey = req.body.productKey ? req.body.productKey : premiumPlan.productKey;

    const planbenefit = req.body.planBenefit.toString();

    premiumPlan.planBenefit = planbenefit ? planbenefit.split(",") : premiumPlan.planBenefit;

    await premiumPlan.save();

    return res.status(200).json({ status: true, message: "Success!", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete PremiumPlan
exports.destroy = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.findById(req.query.premiumPlanId);
    if (!premiumPlan) return res.status(200).json({ status: false, message: "premiumPlan does not found!!" });

    await premiumPlan.deleteOne();

    return res.status(200).json({ status: true, message: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get PremiumPlan
exports.index = async (req, res) => {
  try {
    const premiumPlan = await PremiumPlan.find().sort({
      validityType: 1,
      validity: 1,
    });

    if (!premiumPlan) return res.status(200).json({ status: false, message: "No data found!" });

    return res.status(200).json({ status: true, message: "Success", premiumPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//create PremiumPlanHistory
exports.createHistory = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.premiumPlanId || !req.body.paymentGateway) {
      return res.json({
        status: false,
        message: "Oops ! Invalid details.",
      });
    }

    const [user, premiumPlan] = await Promise.all([User.findById(req.body.userId), PremiumPlan.findById(req.body.premiumPlanId)]);

    if (!user) {
      return res.json({
        status: false,
        message: "User does not found!",
      });
    }

    if (!premiumPlan) {
      return res.json({
        status: false,
        message: "PremiumPlan does not found!",
      });
    }

    const currentDate = new Date();
    let planEndDate = new Date(currentDate);

    if (premiumPlan.validityType === "month") {
      planEndDate.setMonth(currentDate.getMonth() + premiumPlan.validity);
    } else if (premiumPlan.validityType === "year") {
      planEndDate.setFullYear(currentDate.getFullYear() + premiumPlan.validity);
    }

    user.isPremiumPlan = true;
    user.plan.planStartDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    user.plan.planEndDate = planEndDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    user.plan.premiumPlanId = premiumPlan._id;

    const history = new PremiumPlanHistory();
    history.userId = user._id;
    history.premiumPlanId = premiumPlan._id;
    history.paymentGateway = req.body.paymentGateway; // 1.GooglePlay 2.RazorPay 3.Stripe
    history.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    await Promise.all([user.save(), history.save()]);

    res.json({
      status: true,
      message: "Success",
      history,
    });

    if (user.notification.Subscription === true) {
      if (user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: `Plan Purchased`,
            body: `You have purchased through ${history.paymentGateway}.`,
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.title = "Plan Purchased";
            notification.message = `You have purchased through ${history.paymentGateway}.`;
            notification.userId = user._id;
            notification.image = "https://cdn-icons-png.flaticon.com/128/1827/1827370.png";
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get premiumPlanHistory of particular user (admin)
exports.premiumPlanHistory = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.query.userId) {
      const user = await User.findById(req.query.userId);
      if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

      matchQuery = { userId: user._id };
    }

    if (!req.query.startDate || !req.query.endDate || !req.query.start || !req.query.limit) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let dateFilterQuery = {};
    let start_date = new Date(req.query.startDate);
    let end_date = new Date(req.query.endDate);
    if (req.query.startDate !== "ALL" && req.query.endDate !== "ALL") {
      dateFilterQuery = {
        analyticDate: {
          $gte: start_date,
          $lte: end_date,
        },
      };
    }

    const history = await PremiumPlanHistory.aggregate([
      {
        $match: matchQuery,
      },
      {
        $addFields: {
          analyticDate: {
            $toDate: {
              $arrayElemAt: [{ $split: ["$date", ", "] }, 0],
            },
          },
        },
      },
      {
        $match: dateFilterQuery,
      },
      {
        $sort: { analyticDate: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "premiumplans",
          localField: "premiumPlanId",
          foreignField: "_id",
          as: "premiumPlan",
        },
      },
      {
        $unwind: {
          path: "$premiumPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          paymentGateway: 1,
          premiumPlanId: 1,
          userId: 1,
          UserName: "$user.fullName",
          dollar: "$premiumPlan.dollar",
          validity: "$premiumPlan.validity",
          validityType: "$premiumPlan.validityType",
          purchaseDate: "$date",
        },
      },
      {
        $facet: {
          history: [
            { $skip: (start - 1) * limit }, // how many records you want to skip
            { $limit: limit },
          ],
          pageInfo: [
            { $group: { _id: null, totalRecord: { $sum: 1 } } }, // get total records count
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      total: history[0].pageInfo.length > 0 ? history[0].pageInfo[0].totalRecord : 0,
      history: history[0].history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get premiumPlanHistory of particular user (user)
exports.planHistoryOfUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    const history = await PremiumPlanHistory.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "premiumplans",
          localField: "premiumPlanId",
          foreignField: "_id",
          as: "premiumPlan",
        },
      },
      {
        $unwind: {
          path: "$premiumPlan",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          paymentGateway: 1,
          premiumPlanId: 1,
          userId: 1,

          fullName: "$user.fullName",
          nickName: "$user.nickName",
          image: "$user.image",
          planStartDate: "$user.plan.planStartDate",
          planEndDate: "$user.plan.planEndDate",

          dollar: "$premiumPlan.dollar",
          validity: "$premiumPlan.validity",
          validityType: "$premiumPlan.validityType",
          planBenefit: "$premiumPlan.planBenefit",
          //purchaseDate: "$date",
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      history: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
