//movie model
const Movie = require("./movie.model");

//mongoose
const mongoose = require("mongoose");

//axios
const axios = require("axios");

//fetch
const fetch = require("node-fetch");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//notification
const Notification = require("../notification/notification.model");

//private key
const admin = require("../../util/privateKey");

//import model
const User = require("../user/user.model");
const Region = require("../region/region.model");
const Genre = require("../genre/genre.model");
const Download = require("../download/download.model");
const Favorite = require("../favorite/favorite.model");
const Episode = require("../episode/episode.model");
const Trailer = require("../trailer/trailer.model");
const Role = require("../role/role.model");
const Rating = require("../rating/rating.model");
const Season = require("../season/season.model");

//youtubeUrl
const youtubeUrl = "https://www.youtube.com/watch?v=";

//imageUrl
const imageUrl = "https://www.themoviedb.org/t/p/original";

//manual create movie by admin
exports.store = async (req, res) => {
  try {
    if (
      !req.body.title ||
      !req.body.year ||
      !req.body.description ||
      !req.body.region ||
      !req.body.genre ||
      !req.body.type ||
      !req.body.runtime ||
      !req.body.videoType ||
      !req.body.trailerVideoType ||
      !req.body.trailerType ||
      !req.body.trailerName ||
      !req.body.image ||
      !req.body.thumbnail ||
      !req.body.trailerImage ||
      !req.body.link ||
      !req.body.trailerVideoUrl
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const [region, genre] = await Promise.all([Region.findById(req.body.region), Genre.findById(req.body.genre)]);

    if (!region) return res.status(200).json({ status: false, message: "Region does not found!" });
    if (!genre) return res.status(200).json({ status: false, message: "Genre does not found!" });

    const movie = new Movie();
    movie.videoType = req.body.videoType;
    movie.link = req.body.link;
    movie.image = req.body.image;
    movie.thumbnail = req.body.thumbnail;
    movie.title = req.body.title;
    movie.runtime = req.body.runtime;
    movie.year = req.body.year;
    movie.description = req.body.description;
    movie.type = req.body.type;
    movie.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    movie.region = region._id;
    movie.media_type = "movie";
    movie.updateType = 1;
    movie.convertUpdateType.image = 1;
    movie.convertUpdateType.thumbnail = 1;
    movie.convertUpdateType.link = 1;

    //genre
    const multipleGenre = req.body.genre.toString().split(",");
    movie.genre = multipleGenre;

    await movie.save();

    //trailer create
    const trailer = new Trailer();
    trailer.videoType = req.body.trailerVideoType;
    trailer.videoUrl = req.body.trailerVideoUrl;
    trailer.trailerImage = req.body.trailerImage;
    trailer.name = req.body.trailerName;
    trailer.type = req.body.trailerType;
    trailer.movie = movie._id;
    trailer.updateType = 1;
    trailer.convertUpdateType.trailerImage = 1;
    trailer.convertUpdateType.videoUrl = 1;

    const [saveTrailer, data] = await Promise.all([
      trailer.save(),
      Movie.findById(movie._id).populate([
        { path: "region", select: "name" },
        { path: "genre", select: "name" },
      ]),
    ]);

    res.status(200).json({
      status: true,
      message: "Movie has been uploaded by admin!",
      movie: data,
    });

    //New release movie related notification.....
    const userId = await User.find({ "notification.NewReleasesMovie": true }).distinct("_id");

    const userTokens = await User.find({
      "notification.NewReleasesMovie": true,
    }).distinct("fcmToken");

    if (userTokens.length !== 0) {
      const adminPromise = await admin;

      const payload = {
        tokens: userTokens,
        notification: {
          title: `New Release`,
          body: "Stay Tuned: New Movie Alert!",
        },
      };

      adminPromise
        .messaging()
        .sendMulticast(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);

          await userId.map(async (id) => {
            const notification = new Notification();
            notification.title = movie.title;
            notification.message = `${movie.title} is Here! Don't Miss It!`;
            notification.userId = id;
            notification.movieId = movie._id;
            notification.image = movie.image;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          });
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//manual create web series by admin
exports.storeSeries = async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.title ||
      !req.body.year ||
      !req.body.description ||
      !req.body.region ||
      !req.body.genre ||
      !req.body.type ||
      !req.body.trailerVideoType ||
      !req.body.trailerType ||
      !req.body.trailerName ||
      !req.body.image ||
      !req.body.thumbnail ||
      !req.body.trailerImage ||
      !req.body.trailerVideoUrl
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const [region, genre] = await Promise.all([Region.findById(req.body.region), Genre.findById(req.body.genre)]);

    if (!region) return res.status(200).json({ status: false, message: "Region does not found!" });
    if (!genre) return res.status(200).json({ status: false, message: "Genre does not found!" });

    const movie = new Movie();

    movie.image = req.body.image;
    movie.thumbnail = req.body.thumbnail;
    movie.title = req.body.title;
    movie.year = req.body.year;
    movie.description = req.body.description;
    movie.type = req.body.type;
    movie.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    movie.region = region._id;
    movie.media_type = "tv";
    movie.updateType = 1;
    movie.convertUpdateType.image = 1;
    movie.convertUpdateType.thumbnail = 1;

    //genre
    const multipleGenre = req.body.genre.toString().split(",");
    movie.genre = multipleGenre;

    await movie.save();

    //trailer create
    const trailer = new Trailer();

    trailer.videoType = req.body.trailerVideoType;
    trailer.videoUrl = req.body.trailerVideoUrl;
    trailer.trailerImage = req.body.trailerImage;
    trailer.name = req.body.trailerName;
    trailer.type = req.body.trailerType;
    trailer.movie = movie._id;
    trailer.updateType = 1;
    trailer.convertUpdateType.trailerImage = 1;
    trailer.convertUpdateType.videoUrl = 1;

    const [saveTrailer, data] = await Promise.all([
      trailer.save(),
      Movie.findById(movie._id).populate([
        { path: "region", select: "name" },
        { path: "genre", select: "name" },
      ]),
    ]);

    res.status(200).json({
      status: true,
      message: "WebSeries Created Successfully!",
      movie: data,
    });

    //New release movie related notification.....
    const userId = await User.find({
      "notification.NewReleasesMovie": true,
    }).distinct("_id");

    const userTokens = await User.find({
      "notification.NewReleasesMovie": true,
    }).distinct("fcmToken");

    console.log("fcmToken in webSeries:  ", userTokens.length);

    if (userTokens.length !== 0) {
      const adminPromise = await admin;

      const payload = {
        tokens: userTokens,
        notification: {
          title: `New Release`,
          body: "Get Ready: Latest WebSeries Watchlist is Here!",
        },
      };

      adminPromise
        .messaging()
        .sendMulticast(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);

          await userId.map(async (id) => {
            const notification = new Notification();
            notification.title = movie.title;
            notification.message = `Get Ready to Binge: New ${movie.title} Added Today!`;
            notification.userId = id;
            notification.movieId = movie._id;
            notification.image = movie.image;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          });
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get details IMDB id or title wise from TMDB database for admin
exports.getStoredetails = async (req, res) => {
  try {
    if ((!req.query.title || !req.query.IMDBid) && !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.Authorization}`,
      },
    };

    if (!process.env.Authorization) {
      return res.status(200).json({ status: false, message: "TMDB credentials must be requried!" });
    }

    if (req.query.title) {
      //get movie or WebSeries details (https://api.themoviedb.org/3/search/movie?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US&page=1&include_adult=false&query=titanic)

      const url = `https://api.themoviedb.org/3/search/${req.query.type.toUpperCase() === "WEBSERIES" ? "tv" : "movie"}?query=${req.query.title}&include_adult=false&language=en-US&page=1`;

      const result = await fetch(url, options).then((response) => response.json());

      if (!result.results || result.results.length === 0) {
        return res.status(200).json({
          status: false,
          message: "No data found!",
        });
      }

      //get trailer API (https://api.themoviedb.org/3/movie/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

      const trailerFetchUrl = `https://api.themoviedb.org/3/${req.query.type.toUpperCase() === "WEBSERIES" ? "tv" : "movie"}/${
        req.query.type.toUpperCase() === "WEBSERIES" ? result.results[0].id : result.results[0].id
      }/videos?language=en-US`;

      const trailerResult = await fetch(trailerFetchUrl, options).then((response) => response.json());

      if (req.query.type.toUpperCase() === "WEBSERIES") {
        var series = {
          title: result.results[0].name,
          description: result.results[0].overview,
          year: result.results[0].first_air_date,
          image: imageUrl + result.results[0].backdrop_path,
          thumbnail: imageUrl + result.results[0].poster_path,
          media_type: result.results[0].media_type,
          TmdbMovieId: result.results[0].id,
          genre: result.results[0].genre_ids,
          region: result.results[0].origin_country,
          trailerUrl: trailerResult.results.length > 0 ? youtubeUrl + trailerResult.results[0]?.key : null,
        };

        //genre for series
        const genreIds = await result.results[0].genre_ids.map(async (id) => {
          const genere = await Genre.findOne({ uniqueId: id });
          return genere;
        });

        await Promise.all(genreIds).then(function (results) {
          series.genre = results;
        });

        //region for series
        const regionIds = await result.results[0].origin_country.map(async (id) => {
          const region = await Region.findOne({ uniqueId: id });
          return region;
        });

        await Promise.all(regionIds).then(function (results) {
          series.region = results;
        });
      } else {
        var movie = {
          title: result.results[0].title,
          description: result.results[0].overview,
          year: result.results[0].release_date,
          image: imageUrl + result.results[0].backdrop_path,
          thumbnail: imageUrl + result.results[0].poster_path,
          media_type: result.results[0].media_type,
          TmdbMovieId: result.results[0].id,
          genre: result.results[0].genre_ids,
          trailerUrl: trailerResult.results.length > 0 ? youtubeUrl + trailerResult.results[0]?.key : null,
        };

        //genre for movie
        const genreIds = await result.results[0].genre_ids.map(async (id) => {
          const genere = await Genre.findOne({ uniqueId: id });
          return genere;
        });

        await Promise.all(genreIds).then(function (results) {
          movie.genre = results;
        });
      }

      return res.status(200).json({ status: true, message: "Success", movie, series });
    } else if (req.query.IMDBid) {
      //IMDB id Wise API called (https://api.themoviedb.org/3/find/tt27510174?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en&external_source=imdb_id)

      const url = `https://api.themoviedb.org/3/find/${req.query.IMDBid}?external_source=imdb_id`;

      const result = await fetch(url, options).then((response) => response.json());

      if ((req.query.type.toUpperCase() === "WEBSERIES" && result.tv_results.length === 0) || (req.query.type.toUpperCase() === "MOVIE" && result.movie_results.length === 0)) {
        return res.status(200).json({
          status: false,
          message: "No data found!",
        });
      }

      //get trailer API (https://api.themoviedb.org/3/movie/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

      const trailerFetchUrl = `https://api.themoviedb.org/3/${req.query.type.toUpperCase() === "WEBSERIES" ? "tv" : "movie"}/${
        req.query.type.toUpperCase() === "WEBSERIES" ? result.tv_results[0].id : result.movie_results[0].id
      }/videos?language=en-US`;

      const trailerResult = await fetch(trailerFetchUrl, options).then((response) => response.json());

      if (req.query.type.toUpperCase() === "WEBSERIES") {
        var series = {
          title: result.tv_results[0].name,
          description: result.tv_results[0].overview,
          year: result.tv_results[0].first_air_date,
          image: imageUrl + result.tv_results[0].backdrop_path,
          thumbnail: imageUrl + result.tv_results[0].poster_path,
          media_type: result.tv_results[0].media_type,
          TmdbMovieId: result.tv_results[0].id,
          genre: result.tv_results[0].genre_ids,
          region: result.tv_results[0].origin_country,
          trailerUrl: trailerResult.results.length > 0 ? youtubeUrl + trailerResult.results[0]?.key : null,
        };

        //genre for series
        const genreIds = await result.tv_results[0].genre_ids.map(async (id) => {
          const genere = await Genre.findOne({ uniqueId: id });
          return genere;
        });

        await Promise.all(genreIds).then(function (results) {
          series.genre = results;
        });

        //region for series
        const regionIds = await result.tv_results[0].origin_country.map(async (id) => {
          const region = await Region.findOne({ uniqueId: id });
          return region;
        });

        await Promise.all(regionIds).then(function (results) {
          series.region = results;
        });
      } else {
        var movie = {
          title: result.movie_results[0].title,
          description: result.movie_results[0].overview,
          year: result.movie_results[0].release_date,
          image: imageUrl + result.movie_results[0].backdrop_path,
          thumbnail: imageUrl + result.movie_results[0].poster_path,
          media_type: result.movie_results[0].media_type,
          TmdbMovieId: result.movie_results[0].id,
          genre: result.movie_results[0].genre_ids,
          trailerUrl: trailerResult.results.length > 0 ? youtubeUrl + trailerResult.results[0]?.key : null,
        };

        //genre for movie
        const genreIds = await result.movie_results[0].genre_ids.map(async (id) => {
          const genere = await Genre.findOne({ uniqueId: id });
          return genere;
        });

        await Promise.all(genreIds).then(function (results) {
          movie.genre = results;
        });
      }

      return res.status(200).json({ status: true, message: "Success", movie, series });
    } else {
      return res.status(200).json({
        status: false,
        message: "title or IMDBid must be passed valid!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//create movie or webSeries from TMDB database
exports.getStore = async (req, res) => {
  try {
    if (!req.query.TmdbMovieId || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.Authorization}`,
      },
    };

    if (!process.env.Authorization) {
      return res.status(200).json({ status: false, message: "TMDB credentials must be requried!" });
    }

    //get movie or WebSeries details (https://api.themoviedb.org/3/tv/89113?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

    const url = `https://api.themoviedb.org/3/${req.query.type.toUpperCase() === "WEBSERIES" ? "tv" : "movie"}/${req.query.TmdbMovieId}?language=en-US`;

    const result = await fetch(url, options).then((response) => response.json());

    if (!result) {
      return res.status(200).json({
        status: false,
        message: "No data found!",
      });
    }

    if (req.query.type.toUpperCase() === "WEBSERIES") {
      const series = new Movie();

      //genre for series
      const genereArray = await result.genres.map(async (data) => {
        const genereId = await Genre.findOne({ uniqueId: data.id });
        return genereId?._id;
      });

      await Promise.all(genereArray).then(function (results) {
        series.genre = results;
      });

      //region for series
      const regionArray = await result.production_countries.map(async (data) => {
        const regionId = await Region.findOne({
          uniqueID: data.iso_3166_1,
        });
        return regionId._id;
      });

      await Promise.all(regionArray).then(function (results) {
        series.region = results[0];
      });

      //seasonData and episodeData
      await result.seasons.map(async (data) => {
        //seasonData
        const season = new Season();
        season.name = data.name;
        season.seasonNumber = data.season_number;
        season.episodeCount = data.episode_count;
        season.image = imageUrl + data.poster_path;
        season.releaseDate = data.air_date;
        season.TmdbSeasonId = data.id;
        season.movie = series._id;
        await season.save();

        //episodeData (https://api.themoviedb.org/3/tv/89113/season/1?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

        const episodeUrl = `https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/season/${[data.season_number]}?language=en-US`;

        const episodeResult = await fetch(episodeUrl, options).then((response) => response.json());

        await episodeResult.episodes.map(async (data) => {
          const episode = new Episode();
          episode.name = data.name;
          episode.episodeNumber = data.episode_number;
          episode.image = imageUrl + data.still_path;
          episode.seasonNumber = data.season_number;
          episode.runtime = data.runtime;
          episode.TmdbMovieId = data.show_id;
          episode.movie = series._id;
          episode.season = season._id;
          await episode.save();
        });
      });

      //trailer for series (https://api.themoviedb.org/3/tv/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

      const trailerUrl = `https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/videos?language=en-US`;

      const trailerResult = await fetch(trailerUrl, options).then((response) => response.json());

      await trailerResult.results.map(async (data) => {
        const trailerData = new Trailer();
        trailerData.name = data.name;
        trailerData.size = data.size;
        trailerData.type = data.type;
        trailerData.videoUrl = youtubeUrl + data.key;
        trailerData.key = data.key;
        trailerData.trailerImage = imageUrl + result.backdrop_path;
        trailerData.movie = series._id;
        await trailerData.save();
      });

      //credit(cast) for series (https://api.themoviedb.org/3/tv/89113/aggregate_credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)
      const castUrl = `https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/aggregate_credits?language=en-US`;

      const castResult = await fetch(castUrl, options).then((response) => response.json());

      await castResult.cast.map(async (data) => {
        const castData = new Role();
        castData.name = data.name;
        castData.image = imageUrl + data.profile_path;
        castData.position = data.known_for_department;
        castData.movie = series._id;
        await castData.save();
      });

      series.title = result.name;
      series.year = result.first_air_date;
      series.description = result.overview;
      series.image = imageUrl + result.backdrop_path;
      series.thumbnail = imageUrl + result.poster_path;
      series.TmdbMovieId = result.id;
      series.media_type = "tv";
      series.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      await series.save();

      res.status(200).json({
        status: true,
        message: "WebSeries data imported Successfully!",
        series,
      });

      //New release (series) related notification.....
      const userId = await User.find({ "notification.NewReleasesMovie": true }).distinct("_id");

      const userTokens = await User.find({
        "notification.NewReleasesMovie": true,
      }).distinct("fcmToken");

      console.log("fcmToken in series from TMDB: ", userTokens.length);

      if (userTokens.length !== 0) {
        const adminPromise = await admin;

        const payload = {
          tokens: userTokens,
          notification: {
            title: `New Release`,
            body: "Get Ready: Latest WebSeries Watchlist is Here!",
          },
        };

        adminPromise
          .messaging()
          .sendMulticast(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            await userId.map(async (id) => {
              const notification = new Notification();
              notification.title = series.title;
              notification.message = `Get Ready to Binge: New ${series.title} Added Today!`;
              notification.userId = id;
              notification.movieId = series._id;
              notification.image = series.image;
              notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
              await notification.save();
            });
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else if (req.query.type.toUpperCase() === "MOVIE") {
      const movie = new Movie();

      movie.videoType = req.body.videoType;
      movie.link = req.body.link;

      //genre for movie
      const genereArray = await result.genres.map(async (data) => {
        const genereId = await Genre.findOne({ uniqueId: data.id });
        return genereId?._id;
      });

      await Promise.all(genereArray).then(function (results) {
        movie.genre = results;
      });

      //region for movie
      const regionArray = await result.production_countries.map(async (data) => {
        const regionId = await Region.findOne({
          uniqueID: data.iso_3166_1,
        });
        return regionId._id;
      });

      await Promise.all(regionArray).then(function (results) {
        movie.region = results[0];
      });

      //trailer for movie (https://api.themoviedb.org/3/movie/595/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

      const trailerUrl = `https://api.themoviedb.org/3/movie/${req.query.TmdbMovieId}/videos?language=en-US`;

      const trailerResult = await fetch(trailerUrl, options).then((response) => response.json());

      await trailerResult.results.map(async (data) => {
        const trailerData = new Trailer();
        trailerData.name = data.name;
        trailerData.size = data.size;
        trailerData.type = data.type;
        trailerData.videoUrl = youtubeUrl + data.key;
        trailerData.key = data.key;
        trailerData.trailerImage = imageUrl + result.backdrop_path;
        trailerData.movie = movie._id;
        await trailerData.save();
      });

      //credit(cast) for movie (https://api.themoviedb.org/3/movie/595/credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US)

      const castUrl = `https://api.themoviedb.org/3/movie/${req.query.TmdbMovieId}/credits?language=en-US`;

      const castResult = await fetch(castUrl, options).then((response) => response.json());

      await castResult.cast.map(async (data) => {
        const castData = new Role();
        castData.name = data.name;
        castData.image = imageUrl + data.profile_path;
        castData.position = data.known_for_department;
        castData.movie = movie._id;
        await castData.save();
      });

      //for media_type movie find by IMDBid
      const IMDBidMediaType = await result.imdb_id;

      const mediaTypeUrl = `https://api.themoviedb.org/3/find/${IMDBidMediaType}?language=en&external_source=imdb_id`;

      const mediaTypeResult = await fetch(mediaTypeUrl, options).then((response) => response.json());

      movie.media_type = mediaTypeResult.movie_results[0].media_type;
      movie.title = result.title;
      movie.year = result.release_date;
      movie.runtime = result.runtime;
      movie.description = result.overview;
      movie.image = imageUrl + result.backdrop_path;
      movie.thumbnail = imageUrl + result.poster_path;
      movie.TmdbMovieId = result.id;
      movie.IMDBid = result.imdb_id;
      movie.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      await movie.save();

      res.status(200).json({
        status: true,
        message: "Movie data imported Successfully!",
        movie,
      });

      //New release (movie) related notification.....
      const userId = await User.find({
        "notification.NewReleasesMovie": true,
      }).distinct("_id");

      const userTokens = await User.find({
        "notification.NewReleasesMovie": true,
      }).distinct("fcmToken");

      if (userTokens.length !== 0) {
        const adminPromise = await admin;

        const payload = {
          tokens: userTokens,
          notification: {
            title: `New Release`,
            body: "Stay Tuned: New Movie Alert!",
          },
        };

        adminPromise
          .messaging()
          .sendMulticast(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            await userId.map(async (id) => {
              const notification = new Notification();
              notification.title = movie.title;
              notification.message = `${movie.title} is Here! Don't Miss It!`;
              notification.userId = id;
              notification.movieId = movie._id;
              notification.image = movie.image;
              notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
              await notification.save();
            });
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else {
      return res.status(200).json({ status: false, message: "type must me passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get year for movie or series
exports.getYear = async (req, res) => {
  try {
    const movie = await Movie.find().select("year");

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//update movie or weSeries
exports.update = async (req, res) => {
  try {
    if (!req.query.movieId) {
      return res.status(200).json({ status: false, message: "movieId must be requried." });
    }

    if (!req.body.convertUpdateType || !req.body.updateType) {
      return res.status(200).json({ status: false, message: "convertUpdateType and updateType must be requried." });
    }

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(200).json({ status: false, message: "No Movie Was Found." });
    }

    movie.title = req.body.title ? req.body.title : movie.title;
    movie.year = req.body.year ? req.body.year : movie.year;
    movie.region = req.body.region ? req.body.region : movie.region;
    movie.type = req.body.type ? req.body.type : movie.type;
    movie.videoType = req.body.videoType ? req.body.videoType : movie.videoType;
    movie.runtime = req.body.runtime ? req.body.runtime : movie.runtime;
    movie.description = req.body.description ? req.body.description : movie.description;

    const multipleGenre = req.body.genre ? req.body.genre.toString().split(",") : movie.genre;
    movie.genre = multipleGenre;

    if (req.body.image) {
      const urlParts = movie?.image.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3)?.join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      movie.updateType = Number(req.body.updateType); //always be 1
      movie.convertUpdateType.image = Number(req.body.convertUpdateType.image); //always be 1
      movie.image = req.body.image ? req.body.image : movie.image;
    }

    if (req.body.thumbnail) {
      const urlParts = movie?.thumbnail.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      movie.updateType = Number(req.body.updateType); //always be 1
      movie.convertUpdateType.thumbnail = Number(req.body.convertUpdateType.thumbnail); //always be 1
      movie.thumbnail = req.body.thumbnail ? req.body.thumbnail : movie.thumbnail;
    }

    if (req.body.link) {
      const urlParts = movie?.link.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3).join("/"); //Join elements starting from the 4th element

      console.log("folderStructure: ", folderStructure);
      console.log("keyName: ", keyName);

      await deleteFromSpace({ folderStructure, keyName });

      movie.updateType = Number(req.body.updateType); //always be 1
      movie.convertUpdateType.link = Number(req.body.convertUpdateType.link); //always be 1
      movie.link = req.body.link ? req.body.link : movie.link;
    }

    await movie.save();

    const query = [
      { path: "region", select: "name" },
      { path: "genre", select: "name" },
    ];

    const data = await Movie.findById(movie._id).populate(query);

    return res.status(200).json({
      status: true,
      message: "Movie Updated Successfully.",
      movie: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//add view to movie
exports.addView = async (req, res) => {
  try {
    if (!req.query.movieId) {
      return res.status(200).json({ status: false, message: "Movie Id is required!!" });
    }

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) return res.status(200).json({ status: false, message: "No Movie Was Found!!" });

    movie.view += 1;
    await movie.save();

    return res.status(200).json({ status: true, message: "View Added successfully!!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get all top10 through view for android
exports.getAllTop10 = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!" });

    var matchQuery;
    if (req.query.type === "WEB-SERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!" });
    }

    const movie = await Movie.find(matchQuery).sort({ view: -1 }).limit(10);

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get most viewed movies or webSeries for admin panel
exports.getAllCategoryTop10 = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!" });

    var matchQuery;
    if (req.query.type === "WEB-SERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!!" });
    }

    const query = [
      { path: "region", select: ["name"] },
      { path: "genre", select: ["name"] },
    ];

    const movie = await Movie.find(matchQuery).populate(query).sort({ view: -1 }).limit(10);

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//isNewRelease
exports.isNewRelease = async (req, res) => {
  try {
    if (!req.query.movieId) {
      return res.status(200).json({ status: false, message: "Movie Id is required !" });
    }

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(200).json({ status: false, message: "No Movie Was Found!!" });
    }

    movie.isNewRelease = !movie.isNewRelease;
    await movie.save();

    const data = await Movie.findById(movie._id).populate("region", "name");

    return res.status(200).json({ status: true, message: "Success!", movie: data });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};

//get all isNewRelease
exports.getAllNewRelease = async (req, res) => {
  try {
    const movie = await Movie.find({ isNewRelease: true }).sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};

//get movie(all category) wise trailer or episode for android
exports.MovieDetail = async (req, res) => {
  try {
    if (!req.query.movieId || !req.query.userId) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const movieId = new mongoose.Types.ObjectId(req.query.movieId);

    const [movie, user, downloadExist, favorite, planExist, ratingExist] = await Promise.all([
      Movie.findById(movieId),
      User.findById(userId),
      Download.findOne({ userId: userId, movieId: movieId }),
      Favorite.findOne({ userId: userId, movieId: movieId }),
      User.findOne({ _id: userId }, { isPremiumPlan: true }),
      Rating.findOne({
        userId: userId,
        movieId: movieId,
      }),
    ]);

    if (!movie) {
      return res.status(500).json({
        status: false,
        message: "No Movie or Web-Series Were Found.",
      });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    await Movie.aggregate([
      { $match: { _id: movie._id } },
      { $addFields: { isDownload: downloadExist ? true : false } },
      { $addFields: { isFavorite: favorite ? true : false } },
      { $addFields: { isPlan: planExist.isPremiumPlan ? true : false } },
      { $addFields: { isRating: ratingExist ? true : false } },
      {
        $lookup: {
          from: "episodes",
          let: {
            movieId: movie._id,
          },
          as: "episode",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$$movieId", "$movie"] }, { $eq: ["$seasonNumber", 1] }],
                },
              },
            },
            { $sort: { episodeNumber: 1 } },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "trailers",
          let: {
            movieId: movie._id,
          },
          as: "trailer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "roles",
          let: {
            movieId: movie._id,
          },
          as: "role",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "seasons",
          let: {
            movieId: movie._id,
          },
          as: "season",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $sort: { seasonNumber: 1 } },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: {
            movie: movie._id,
          },
          as: "rating",

          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movie", "$movieId"] },
              },
            },
            {
              $group: {
                _id: "$movieId",
                totalUser: { $sum: 1 }, //totalRating by user
                avgRating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          thumbnail: 0,
          date: 0,
        },
      },
    ]).exec(async (error, data) => {
      if (error) console.log(error);
      else {
        const data_ = await Movie.populate(data, [
          { path: "region", select: "name" },
          { path: "genre", select: "name" },
        ]);

        return res.status(200).json({ status: true, message: "Success", movie: data_ });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get movie(all category) wise trailer or episode for admin
exports.MovieDetails = async (req, res) => {
  try {
    if (!req.query.movieId) return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });

    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(500).json({ status: false, message: "No Movie Was Found!!" });
    }

    await Movie.aggregate([
      {
        $match: { _id: movie._id },
      },
      {
        $lookup: {
          from: "episodes",
          let: {
            movieId: movie._id,
          },
          as: "episode",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$$movieId", "$movie"] }, { $eq: ["$seasonNumber", 1] }],
                },
              },
            },
            { $sort: { episodeNumber: 1 } },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "trailers",
          let: {
            movieId: movie._id,
          },
          as: "trailer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "roles",
          let: {
            movieId: movie._id,
          },
          as: "role",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movieId", "$movie"] },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: {
            movie: movie._id,
          },
          as: "rating",

          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$movie", "$movieId"] },
              },
            },
            {
              $group: {
                _id: "$movieId",
                totalUser: { $sum: 1 }, //totalRating by user
                avgRating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          date: 0,
        },
      },
    ]).exec(async (error, data) => {
      if (error) console.log(error);
      else {
        const data_ = await Movie.populate(data, [
          { path: "region", select: "name" },
          { path: "genre", select: "name" },
        ]);

        return res.status(200).json({ status: true, message: "Success!", movie: data_ });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//searching in Movie
exports.search = async (req, res) => {
  try {
    if (!req.body.search) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    const query = [
      { path: "region", select: ["name"] },
      { path: "genre", select: ["name"] },
    ];

    if (req.body.search) {
      const response = await Movie.find({ title: { $regex: req.body.search, $options: "i" } }).populate(query);

      return res.status(200).json({ status: true, message: "Success", movie: response });
    } else if (req.body.search === "") {
      return res.status(200).json({ status: true, message: "No data found.", movie: [] });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all movie for admin
exports.getAll = async (req, res) => {
  try {
    if (!req.query.type || !req.query.start || !req.query.limit) return res.status(200).json({ status: false, message: "Oops! Invalid details." });

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    var matchQuery;
    if (req.query.type === "WEBSERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!!" });
    }

    var searchQuery;
    searchQuery = {
      title: { $regex: req?.query?.search, $options: "i" },
    };

    const query = [
      { path: "region", select: ["name"] },
      { path: "genre", select: ["name"] },
    ];

    if (req.query.search) {
      const [totalMoviesWebSeries, movie] = await Promise.all([
        Movie.countDocuments({ ...matchQuery, ...searchQuery }),
        Movie.find({ ...matchQuery, ...searchQuery })
          .populate(query)
          .sort({ createdAt: -1 })
          .skip((start - 1) * limit)
          .limit(limit),
      ]);

      return res.status(200).json({
        status: true,
        message: "Success",
        totalMoviesWebSeries: totalMoviesWebSeries,
        movie: movie,
      });
    } else {
      const [totalMoviesWebSeries, movie] = await Promise.all([
        Movie.countDocuments(matchQuery),
        Movie.find(matchQuery)
          .populate(query)
          .sort({ createdAt: -1 })
          .skip((start - 1) * limit)
          .limit(limit),
      ]);

      return res.status(200).json({
        status: true,
        message: "Success",
        totalMoviesWebSeries: totalMoviesWebSeries,
        movie: movie,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete movie for admin
exports.destroy = async (req, res) => {
  try {
    const movie = await Movie.findById(mongoose.Types.ObjectId(req.query.movieId));
    if (!movie) {
      return res.status(200).json({ status: false, message: "No movie was found!!" });
    }

    if (movie.link) {
      //delete the old link from digitalOcean Spaces
      const urlParts = movie.link.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    if (movie.image) {
      //delete the old image from digitalOcean Spaces
      const urlParts = movie.image.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    if (movie.thumbnail) {
      //delete the old thumbnail from digitalOcean Spaces
      const urlParts = movie.thumbnail.split("/");
      const keyName = urlParts.pop(); //remove the last element
      const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });
    }

    //delete season
    const season = await Season.find({ movie: movie._id });
    if (season.length > 0) {
      await season.map(async (seasonData) => {
        if (seasonData?.image) {
          //delete the old episodeImage from digitalOcean Spaces
          const urlParts = seasonData?.image.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await seasonData.deleteOne();
      });
    }

    //delete episode
    const episode = await Episode.find({ movie: movie._id });
    if (episode.length > 0) {
      await episode.map(async (episodeData) => {
        if (episodeData.videoUrl) {
          //delete the old episodeVideo from digitalOcean Spaces
          const urlParts = episodeData.videoUrl.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        if (episodeData.image) {
          //delete the old episodeImage from digitalOcean Spaces
          const urlParts = episodeData.image.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await episodeData.deleteOne();
      });
    }

    //delete trailer
    const trailer = await Trailer.find({ movie: movie._id });
    if (trailer.length > 0) {
      await trailer.map(async (trailerData) => {
        if (trailerData.videoUrl) {
          //delete the old trailerVideourl from digitalOcean Spaces
          const urlParts = trailerData.videoUrl.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        if (trailerData.trailerImage) {
          //delete the old trailerImage from digitalOcean Spaces
          const urlParts = trailerData.trailerImage.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await trailerData.deleteOne();
      });
    }

    //delete role
    const role = await Role.find({ movie: movie._id });
    if (role.length > 0) {
      await role.map(async (roleData) => {
        if (roleData.image) {
          //delete the old image from digitalOcean Spaces
          const urlParts = roleData.image.split("/");
          const keyName = urlParts.pop(); //remove the last element
          const folderStructure = urlParts.slice(3).join("/"); //Join elements starting from the 4th element

          await deleteFromSpace({ folderStructure, keyName });
        }

        await roleData.deleteOne();
      });
    }

    await movie.deleteOne();

    return res.status(200).json({
      status: true,
      message: "All Movie related data deleted Successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};

//get all more like this movie
exports.getAllLikeThis = async (req, res) => {
  try {
    if (!req.query.movieId) return res.status(200).json({ status: true, message: "Oops ! Invalid details." });

    const movieExist = await Movie.findById(req.query.movieId);
    if (!movieExist) {
      return res.status(200).json({ status: false, message: "Movie does not found." });
    }

    const movie = await Movie.find({
      _id: { $ne: movieExist._id },
      media_type: { $eq: movieExist.media_type },
      //category: movieExist.category,
    });

    return res.status(200).json({ status: true, message: "Success", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all movie for android
exports.getMovie = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    const planExist = await User.findOne({ _id: user._id }, { isPremiumPlan: true });

    await Movie.aggregate([
      { $addFields: { isPlan: planExist.isPremiumPlan ? true : false } },
      {
        $lookup: {
          from: "trailers",
          let: {
            movieId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$movieId", "$movie"] },
                    {
                      $or: [{ $eq: ["$type", "Trailer"] }, { $eq: ["$type", "Teaser"] }],
                    },
                  ],
                },
              },
            },
            { $project: { __v: 0, updatedAt: 0, createdAt: 0 } },
          ],
          as: "trailer",
        },
      },
      {
        $lookup: {
          from: "favorites",
          let: {
            movieId: "$_id",
            userId: user._id,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$movieId", "$$movieId"] }, { $eq: ["$userId", user._id] }],
                },
              },
            },
          ],
          as: "isFavorite",
        },
      },
      {
        $project: {
          year: 1,
          isNewRelease: 1,
          image: 1,
          title: 1,
          description: 1,
          region: 1,
          genre: 1,
          type: 1,
          thumbnail: 1,
          TmdbMovieId: 1,
          IMDBid: 1,
          media_type: 1,
          isPlan: 1,
          isFavorite: {
            $cond: [{ $eq: [{ $size: "$isFavorite" }, 0] }, false, true],
          },
          trailer: 1,
        },
      },
    ]).exec(async (error, data) => {
      if (error) {
        console.log(error);
      } else {
        const data_ = await Movie.populate(data, [
          { path: "region", select: "name" },
          { path: "genre", select: "name" },
        ]);

        return res.status(200).json({ status: true, message: "Success!", movie: data_ });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: true,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all movie or webSeries filterWise
exports.MovieFilterWise = async (req, res) => {
  try {
    var regionArray = [];
    if (req?.body?.region) {
      const array = Array.isArray(req.body.region) ? req.body.region : [req.body.region];
      for (const region of array) {
        const elements = region.split(",");

        for (const element of elements) {
          regionArray.push(new mongoose.Types.ObjectId(element));
        }
      }
    }

    var genreArray = [];
    if (req?.body?.genre) {
      const array = Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre];
      for (const genre of array) {
        const elements = genre.split(",");

        for (const element of elements) {
          genreArray.push(new mongoose.Types.ObjectId(element));
        }
      }
    }

    var yearArray = [];
    if (req?.body?.year) {
      const array = Array.isArray(req.body.year) ? req.body.year : [req.body.year];
      for (const year of array) {
        const elements = year.split(",");

        for (const element of elements) {
          yearArray.push(element);
        }
      }
    }

    var typeArray = [];
    if (req?.body?.media_type) {
      const array = Array.isArray(req.body.media_type) ? req.body.media_type : [req.body.media_type];
      for (const media_type of array) {
        const elements = media_type.split(",");

        for (const element of elements) {
          typeArray.push(element);
        }
      }
    }

    const movie = await Movie.aggregate([
      {
        $match: {
          $or: [{ region: { $in: regionArray } }, { genre: { $in: genreArray } }, { year: { $in: yearArray } }, { media_type: { $in: typeArray } }],
          //media_type: { $in: typeArray },
        },
      },
      {
        $project: {
          _id: 1,
          year: 1,
          isNewRelease: 1,
          image: 1,
          thumbnail: 1,
          title: 1,
          media_type: 1,
          region: 1,
          genre: 1,
          TmdbMovieId: 1,
          IMDBid: 1,
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//best ComedyMovie for android (home)
exports.bestComedyMovie = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });

    var matchQuery;
    if (req.query.type.toUpperCase() === "COMEDY") {
      matchQuery = { genre: "641c4c6e9620e83adb56676d", media_type: "movie" };
    }

    const movie = await Movie.find(matchQuery).sort({ view: -1 });

    return res.status(200).json({ status: true, message: "Retrive best Comedy Movie!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get topRated movies or webseries for android
exports.getAllTopRated = async (req, res) => {
  try {
    if (!req.query.type) return res.status(200).json({ status: false, message: "Oops! Invalid details!" });

    let matchQuery = {};
    if (req.query.type === "WEB-SERIES") {
      matchQuery = { media_type: "tv" };
    } else if (req.query.type === "MOVIE") {
      matchQuery = { media_type: "movie" };
    } else {
      return res.status(200).json({ status: false, message: "Pass Valid Type!" });
    }

    const movie = await Movie.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "movieId",
          as: "movieRating",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          //ratingAverage: { $avg: "$movieRating.rating" },
          ratingAverage: {
            $cond: {
              if: { $eq: [{ $avg: "$movieRating.rating" }, null] },
              then: { $avg: 0 },
              else: { $avg: "$movieRating.rating" },
            },
          },
          link: 1,
          image: 1,
          thumbnail: 1,
          title: 1,
          category: 1,
          type: 1,
          media_type: 1,
          TmdbMovieId: 1,
          IMDBid: 1,
        },
      },
      { $sort: { ratingAverage: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({ status: true, message: "Success!", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//directly upload images from TMDb to your DigitalOcean Spaces
exports.getStoreFromTMDBToSpace = async (req, res) => {
  try {
    if (!req.query.TmdbMovieId || !req.query.type.toUpperCase()) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const aws = require("aws-sdk");

    const s3 = new aws.S3({
      accessKeyId: process?.env?.aws_access_key_id,
      secretAccessKey: process?.env?.aws_secret_access_key,
      endpoint: new aws.Endpoint(process?.env?.hostname),
    });

    async function uploadImageToS3(url, folderStructure, keyName) {
      const response = await axios.get(url, { responseType: "stream" });
      const params = {
        Bucket: process.env.bucketName,
        Key: `${folderStructure}/${keyName}`,
        Body: response.data,
        ACL: "public-read",
        ContentType: response.headers["content-type"],
      };
      return s3.upload(params).promise();
    }

    const tmdbApiKey = "67af5e631dcbb4d0981b06996fcd47bc";
    const imageUrlBase = "https://image.tmdb.org/t/p/original";

    await axios
      .get(`https://api.themoviedb.org/3/${req.query.type === "WEBSERIES" ? "tv" : "movie"}/${req.query.TmdbMovieId}?api_key=${tmdbApiKey}&language=en-US`)
      .then(async (result) => {
        const mediaType = req.query.type === "WEBSERIES" ? "tv" : "movie";
        const mediaData = result.data;
        const folderStructure = `mova/TMDB/${mediaType}`;

        const keyNameBackdrop = `backdrop_${mediaData.id}`;
        const keyNamePoster = `poster_${mediaData.id}`;

        const backdropUploadResult = await uploadImageToS3(`${imageUrlBase}${mediaData.backdrop_path}`, folderStructure, keyNameBackdrop);
        const backdropImageUrl = backdropUploadResult.Location;

        const posterUploadResult = await uploadImageToS3(`${imageUrlBase}${mediaData.poster_path}`, folderStructure, keyNamePoster);
        const posterImageUrl = posterUploadResult.Location;

        if (req.query.type === "WEBSERIES") {
          const series = new Movie();

          //genre for series
          const genereArray = await mediaData.genres.map(async (data) => {
            const genereId = await Genre.findOne({ uniqueId: data.id });
            return genereId?._id;
          });

          await Promise.all(genereArray).then(function (results) {
            series.genre = results;
          });

          //region for series
          const regionArray = await mediaData.production_countries.map(async (data) => {
            const regionId = await Region.findOne({
              uniqueID: data.iso_3166_1,
            });
            return regionId._id;
          });

          await Promise.all(regionArray).then(function (results) {
            series.region = results[0];
          });

          await mediaData.seasons.map(async (data) => {
            const keyName = `seasonImage${data.poster_path}`;

            const seasonImageUploadResult = await uploadImageToS3(`${imageUrlBase}${data.poster_path}`, folderStructure, keyName);
            const seasonImageUrl = seasonImageUploadResult.Location;

            const season = new Season();
            season.name = data.name;
            season.seasonNumber = data.season_number;
            season.episodeCount = data.episode_count;
            season.image = seasonImageUrl;
            season.releaseDate = data.air_date;
            season.TmdbSeasonId = data.id;
            season.movie = series._id;
            await season.save();

            await axios
              .get(
                `https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/season/
                   ${[data.season_number]}?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`
              )
              .then(async (resultEpisode) => {
                await resultEpisode.data.episodes.map(async (data) => {
                  const keyName = `episodeImage${data.still_path}`;

                  const episodeImageUploadResult = await uploadImageToS3(`${imageUrlBase}${data.still_path}`, folderStructure, keyName);
                  const episodeImageUrl = episodeImageUploadResult.Location;

                  const episode = new Episode();
                  episode.name = data.name;
                  episode.episodeNumber = data.episode_number;
                  episode.image = episodeImageUrl;
                  episode.seasonNumber = data.season_number;
                  episode.runtime = data.runtime;
                  episode.TmdbMovieId = data.show_id;
                  episode.movie = series._id;
                  episode.season = season._id;
                  await episode.save();
                });
              })
              .catch((error) => console.log(error));
          });

          //trailer for series API call
          await axios
            .get(`https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`)
            .then(async (response) => {
              await response.data.results.map(async (data) => {
                const trailerData = new Trailer();
                trailerData.name = data.name;
                trailerData.size = data.size;
                trailerData.type = data.type;
                trailerData.videoUrl = youtubeUrl + data.key;
                trailerData.key = data.key;
                trailerData.trailerImage = backdropImageUrl;
                trailerData.movie = series._id;
                await trailerData.save();
              });
            })
            .catch((error) => console.log(error));

          //credit(cast) for series API call
          await axios
            .get(`https://api.themoviedb.org/3/tv/${req.query.TmdbMovieId}/aggregate_credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`)
            .then(async (creditRes) => {
              await creditRes.data.cast.map(async (data) => {
                const keyName = `roleImage${data.profile_path}`;

                const roleImageUploadResult = await uploadImageToS3(`${imageUrlBase}${data.profile_path}`, folderStructure, keyName);
                const roleImageUrl = roleImageUploadResult.Location;

                const castData = new Role();
                castData.name = data.name;
                castData.image = roleImageUrl;
                castData.position = data.known_for_department;
                castData.movie = series._id;
                await castData.save();
              });
            })
            .catch((error) => console.log(error));

          series.title = mediaData.name;
          series.year = mediaData.first_air_date;
          series.description = mediaData.overview;
          series.image = backdropImageUrl;
          series.thumbnail = posterImageUrl;
          series.TmdbMovieId = mediaData.id;
          series.media_type = "tv";
          series.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          await series.save();

          res.status(200).json({
            status: true,
            message: "WebSeries data imported Successfully!",
            series,
          });
        } else if (req.query.type === "MOVIE") {
          const movie = new Movie();

          //genre for movie
          const genereArray = await result.data.genres.map(async (data) => {
            const genereId = await Genre.findOne({ uniqueId: data.id });
            return genereId?._id;
          });

          await Promise.all(genereArray).then(function (results) {
            movie.genre = results;
          });

          //region for movie
          const regionArray = await result.data.production_countries.map(async (data) => {
            const regionId = await Region.findOne({
              uniqueID: data.iso_3166_1,
            });
            return regionId._id;
          });

          await Promise.all(regionArray).then(function (results) {
            movie.region = results[0];
          });

          //trailer for movie API call
          await axios
            .get(`https://api.themoviedb.org/3/movie/${req.query.TmdbMovieId}/videos?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`)
            .then(async (response) => {
              await response.data.results.map(async (data) => {
                const trailerData = new Trailer();
                trailerData.name = data.name;
                trailerData.size = data.size;
                trailerData.type = data.type;
                trailerData.videoUrl = youtubeUrl + data.key;
                trailerData.key = data.key;
                trailerData.trailerImage = backdropImageUrl;
                trailerData.movie = movie._id;
                await trailerData.save();
              });
            })
            .catch((error) => console.log(error));

          //credit(cast) for movie API call
          await axios
            .get(`https://api.themoviedb.org/3/movie/${req.query.TmdbMovieId}/credits?api_key=67af5e631dcbb4d0981b06996fcd47bc&language=en-US`)
            .then(async (creditRes) => {
              await creditRes.data.cast.map(async (data) => {
                const keyName = `roleImage${data.profile_path}`;

                const roleImageUploadResult = await uploadImageToS3(`${imageUrlBase}${data.profile_path}`, folderStructure, keyName);
                const roleImageUrl = roleImageUploadResult.Location;

                const castData = new Role();
                castData.name = data.name;
                castData.image = roleImageUrl;
                castData.position = data.known_for_department;
                castData.movie = movie._id;
                await castData.save();
              });
            })
            .catch((error) => console.log(error));

          //for media_type movie find by IMDBid API call
          const IMDBidMediaType = await result.data.imdb_id;

          await axios
            .get(`https://api.themoviedb.org/3/find/${IMDBidMediaType}?api_key=10471161c6c1b74f6278ff73bfe95982&language=en&external_source=imdb_id`)
            .then(async (result) => {
              movie.media_type = result.data.movie_results[0].media_type;
            })
            .catch((error) => console.log(error));

          movie.videoType = req.body.videoType;
          movie.link = req.body.link;
          movie.title = mediaData.title;
          movie.year = mediaData.release_date;
          movie.runtime = mediaData.runtime;
          movie.description = mediaData.overview;
          movie.image = backdropImageUrl;
          movie.thumbnail = posterImageUrl;
          movie.TmdbMovieId = mediaData.id;
          movie.IMDBid = mediaData.imdb_id;
          movie.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          await movie.save();

          res.status(200).json({
            status: true,
            message: "Movie data imported Successfully!",
            movie,
          });
        } else {
          return res.status(200).json({ status: false, message: "type must be passed valid." });
        }
      })
      .catch((error) => console.log(error));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
