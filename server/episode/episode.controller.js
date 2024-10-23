const Episode = require("./episode.model");

//mongoose
const mongoose = require("mongoose");

//import model
const Movie = require("../movie/movie.model");
const Season = require("../season/season.model");

//deleteFromSpace
const { deleteFromSpace } = require("../../util/deleteFromSpace");

//create episode
exports.store = async (req, res) => {
  try {
    console.log("req body in episode create", req.body);

    if (!req.body.name || !req.body.episodeNumber || !req.body.season || !req.body.movieId || !req.body.videoType || !req.body.videoUrl || !req.body.image) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (!req.body.movieId || !req.body.season) {
      return res.status(200).json({ status: false, message: "movieId and seasonId must be requried." });
    }

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
      return res.status(200).json({ status: false, message: "Movie does not found." });
    }

    const season = await Season.findById(req.body.season);
    if (!season) {
      return res.status(200).json({ status: false, message: "Season does not found." });
    }

    const episode = new Episode();

    episode.image = req.body.image;
    episode.videoUrl = req.body.videoUrl;
    episode.name = req.body.name;
    episode.episodeNumber = req.body.episodeNumber;
    episode.videoType = req.body.videoType;
    episode.movie = movie._id;
    episode.season = season._id;
    episode.seasonNumber = season.seasonNumber;

    episode.updateType = 1;
    episode.convertUpdateType.image = 1;
    episode.convertUpdateType.videoUrl = 1;

    season.episodeCount += 1;

    // if (!movie.season.includes(req.body.season)) {
    //   movie.season.push(req.body.season);
    //   await movie.save();
    // }

    await Promise.all([season.save(), episode.save()]);

    const data = await Episode.aggregate([
      {
        $match: { _id: episode._id },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          name: 1,
          episodeNumber: 1,
          seasonNumber: 1,
          season: 1,
          runtime: 1,
          videoType: 1,
          videoUrl: 1,
          image: 1,
          TmdbMovieId: 1,
          createdAt: 1,
          title: "$movie.title",
          movieId: "$movie._id",
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Episode Added Successfully.",
      Episode: data[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update episode
exports.update = async (req, res) => {
  try {
    console.log("req body in episode update   ", req.body);

    const episode = await Episode.findById(req.query.episodeId);
    if (!episode) {
      return res.status(200).json({ status: false, message: "episode does not found!!" });
    }

    episode.name = req.body.name ? req.body.name : episode.name;
    episode.runtime = req.body.runtime ? req.body.runtime : episode.runtime;
    episode.videoType = req.body.videoType ? req.body.videoType : episode.videoType;
    episode.episodeNumber = req.body.episodeNumber ? req.body.episodeNumber : episode.episodeNumber;
    episode.movie = req.body.movie ? req.body.movie : episode.movie;
    episode.season = req.body.season ? req.body.season : episode.season;
    //episode.season = req.body.season ? req.body.season.split(",") : episode.season;

    //delete the old image and videoUrl from digitalOcean Spaces
    if (req.body.image) {
      if (!req.body.convertUpdateType || !req.body.updateType) {
        return res.status(200).json({ status: false, message: "convertUpdateType and updateType must be requried." });
      }

      const urlParts = episode.image.split("/");
      const keyName = urlParts.pop();
      const folderStructure = urlParts.slice(3).join("/");

      await deleteFromSpace({ folderStructure, keyName });

      episode.updateType = Number(req.body.updateType) || 1; //always be 1
      episode.convertUpdateType.image = Number(req.body.convertUpdateType.image) || 1; //always be 1
      episode.image = req.body.image ? req.body.image : episode.image;
    }

    if (req.body.videoUrl) {
      if (req.body.videoType == 6 && (!req.body.convertUpdateType || !req.body.updateType)) {
        return res.status(200).json({ status: false, message: "convertUpdateType and updateType must be requried." });
      }

      const urlParts = episode?.videoUrl.split("/");
      const keyName = urlParts?.pop(); //remove the last element
      const folderStructure = urlParts?.slice(3).join("/"); //Join elements starting from the 4th element

      await deleteFromSpace({ folderStructure, keyName });

      episode.updateType = Number(req.body.updateType) || 1; //always be 1
      episode.convertUpdateType.videoUrl = Number(req.body.convertUpdateType.videoUrl) || 1; //always be 1
      episode.videoUrl = req.body.videoUrl ? req.body.videoUrl : episode.videoUrl;
    }

    //old seasonId
    const episodeData = await Episode.findOne({ _id: episode._id });
    const oldSeasonId = episodeData.season;
    const oldSeasonData = await Season.findById(oldSeasonId);

    //new seasonId
    const NewSeasonData = await Season.findById(req.body.season);

    oldSeasonData.episodeCount -= 1;
    NewSeasonData.episodeCount += 1;

    await Promise.all([oldSeasonData.save(), NewSeasonData.save(), episode.save()]);

    const data = await Episode.aggregate([
      {
        $match: { _id: episode._id },
      },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          name: 1,
          episodeNumber: 1,
          seasonNumber: 1,
          season: 1,
          runtime: 1,
          videoType: 1,
          videoUrl: 1,
          image: 1,
          title: "$movie.title",
          movieId: "$movie._id",
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Episode Updated Successfully.",
      episode: data[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get episode
exports.get = async (req, res) => {
  try {
    const episode = await Episode.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          videoType: 1,
          videoUrl: 1,
          seasonNumber: 1,
          season: 1,
          runtime: 1,
          episodeNumber: 1,
          TmdbMovieId: 1,
          updateType: 1,
          convertUpdateType: 1,
          createdAt: 1,
          title: "$movie.title",
          movieId: "$movie._id",
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Retrive episodes by the admin.", episode });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete episode
exports.destroy = async (req, res) => {
  try {
    const episode = await Episode.findById(mongoose.Types.ObjectId(req.query.episodeId));
    if (!episode) {
      return res.status(200).json({ status: false, message: "Episode does not found." });
    }

    //delete the old image and videoUrl from digitalOcean Spaces
    if (episode.image) {
      const urlParts = episode.image.split("/");
      const keyName = urlParts.pop();
      const folderStructure = urlParts.slice(3).join("/");

      await deleteFromSpace({ folderStructure, keyName });
    }

    if (episode.videoUrl) {
      const urlParts = episode.videoUrl.split("/");
      const keyName = urlParts.pop();
      const folderStructure = urlParts.slice(3).join("/");

      await deleteFromSpace({ folderStructure, keyName });
    }

    const episodeData = await Episode.findOne({ _id: episode._id });
    const seasonId = episodeData.season;
    await Season.updateOne({ _id: seasonId }, { $inc: { episodeCount: -1 } });

    await episode.deleteOne();

    return res.status(200).json({ status: true, message: "Episode deleted by the admin." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get season wise episode for admin
exports.seasonWiseEpisode = async (req, res) => {
  try {
    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(200).json({ status: false, message: "No Movie Was found." });
    }

    const season = await Season.findOne({ _id: new mongoose.Types.ObjectId(req?.query?.seasonId?.trim()) });

    if (req.query.seasonId) {
      if (req.query.seasonId === "AllSeasonGet") {
        const episode = await Episode.aggregate([
          {
            $match: {
              movie: movie._id,
            },
          },
          { $sort: { seasonNumber: 1, episodeNumber: 1 } },
          {
            $lookup: {
              from: "movies",
              localField: "movie",
              foreignField: "_id",
              as: "movie",
            },
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              name: 1,
              image: 1,
              videoType: 1,
              videoUrl: 1,
              episodeNumber: 1,
              seasonNumber: 1,
              TmdbMovieId: 1, //show_id
              updateType: 1,
              convertUpdateType: 1,
              createdAt: 1,
              season: 1,
              title: "$movie.title",
              movieId: "$movie._id",
            },
          },
        ]);

        return res.status(200).json({
          status: true,
          message: "Retrive season's episodes!",
          episode,
        });
      } else {
        if (!season) {
          return res.status(200).json({ status: false, message: "No Season Was Found!!" });
        }

        const episode = await Episode.aggregate([
          {
            $match: {
              $and: [{ movie: movie._id }, { season: season._id }],
            },
          },
          {
            $sort: { episodeNumber: 1 },
          },
          {
            $lookup: {
              from: "movies",
              localField: "movie",
              foreignField: "_id",
              as: "movie",
            },
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              episodeNumber: 1,
              seasonNumber: 1,
              season: 1,
              runtime: 1,
              TmdbMovieId: 1, //show_id
              videoType: 1,
              videoUrl: 1,
              image: 1,
              updateType: 1,
              convertUpdateType: 1,
              createdAt: 1,
              season: 1,
              movieId: "$movie._id",
              title: "$movie.title",
            },
          },
        ]);

        return res.status(200).json({
          status: true,
          message: "get Season Wise episodes!",
          episode,
        });
      }
    } else {
      return res.status(200).json({ status: true, message: "seasonId must be requried." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get season wise episode for android
exports.seasonWiseEpisodeAndroid = async (req, res) => {
  try {
    const movie = await Movie.findById(req.query.movieId);
    if (!movie) {
      return res.status(200).json({ status: false, message: "No Movie Was Found." });
    }

    const episode = await Episode.aggregate([
      {
        $match: {
          $and: [{ movie: movie._id }, { seasonNumber: parseInt(req.query.seasonNumber) }],
        },
      },
      {
        $sort: { episodeNumber: 1 },
      },
      {
        $lookup: {
          from: "movies",
          localField: "movie",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: {
          path: "$movie",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          episodeNumber: 1,
          seasonNumber: 1,
          season: 1,
          runtime: 1,
          TmdbMovieId: 1, //show_id
          videoType: 1,
          videoUrl: 1,
          image: 1,
          movieId: "$movie._id",
          title: "$movie.title",
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Retrive season wise episode!", episode });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get movie only if type web series
exports.getSeries = async (req, res) => {
  try {
    var matchQuery;

    if (req.query.type === "SERIES") {
      matchQuery = { media_type: "tv" };
    }

    const movie = await Movie.find(matchQuery).sort({ createdAt: 1 });

    return res.status(200).json({ status: true, message: "Success", movie });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
