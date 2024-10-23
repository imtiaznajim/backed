const express = require("express");
const app = express.Router();

//Admin Route
const AdminRoute = require("./server/admin/admin.route");
app.use("/admin", AdminRoute);

//User Route
const UserRoute = require("./server/user/user.route");
app.use("/user", UserRoute);

//Movie Route
const MovieRoute = require("./server/movie/movie.route");
app.use("/movie", MovieRoute);

//Region Route
const RegionRoute = require("./server/region/region.route");
app.use("/region", RegionRoute);

//Genre Route
const GenreRoute = require("./server/genre/genre.route");
app.use("/genre", GenreRoute);

//Favorite Route
const FavoriteRoute = require("./server/favorite/favorite.route");
app.use("/favorite", FavoriteRoute);

//Role Route
const RoleRoute = require("./server/role/role.route");
app.use("/role", RoleRoute);

//Trailer Route
const TrailerRoute = require("./server/trailer/trailer.route");
app.use("/trailer", TrailerRoute);

//Episode route
const EpisodeRoute = require("./server/episode/episode.route");
app.use("/episode", EpisodeRoute);

//Comment route
const CommentRoute = require("./server/comment/comment.route");
app.use("/comment", CommentRoute);

//Like route
const LikeRoute = require("./server/like/like.route");
app.use("/like", LikeRoute);

//PremiumPlan route
const PremiumPlanRoute = require("./server/premiumPlan/premiumPlan.route");
app.use("/premiumPlan", PremiumPlanRoute);

//Setting route
const SettingRoute = require("./server/setting/setting.route");
app.use("/setting", SettingRoute);

//Notification route
const NotificationRoute = require("./server/notification/notification.route");
app.use("/notification", NotificationRoute);

//Download route
const DownloadRoute = require("./server/download/download.route");
app.use("/download", DownloadRoute);

//Dashboard Route
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

//FAQ Route
const FAQRoute = require("./server/FAQ/FAQ.route");
app.use("/FAQ", FAQRoute);

//ContactUs Route
const ContactUsRoute = require("./server/contactUs/contactUs.route");
app.use("/contactUs", ContactUsRoute);

//Rating Route
const RatingRoute = require("./server/rating/rating.route");
app.use("/rate", RatingRoute);

//Season Route
const SeasonRoute = require("./server/season/season.route");
app.use("/season", SeasonRoute);

//Advertisement Route
const AdvertisementRoute = require("./server/advertisement/advertisement.route");
app.use("/advertisement", AdvertisementRoute);

//CountryLiveTV Route
const CountryLiveTVRoute = require("./server/countryLiveTV/countryLiveTV.route");
app.use("/countryLiveTV", CountryLiveTVRoute);

//Stream Route
const StreamRoute = require("./server/stream/stream.route");
app.use("/stream", StreamRoute);

//Flag Route
const FlagRoute = require("./server/flag/flag.route");
app.use("/flag", FlagRoute);

//File Route
const FileRoute = require("./server/file/file.route");
app.use("/file", FileRoute);

//Login Route
const LoginRoute = require("./server/login/login.route");
app.use("/", LoginRoute);

//TicketByUser Route
const TicketByUserRoute = require("./server/ticketByUser/ticketByUser.route");
app.use("/ticketByUser", TicketByUserRoute);

module.exports = app;
