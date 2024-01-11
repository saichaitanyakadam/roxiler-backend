import Data from "../model/data.model.js";

const postData = async (req, res) => {
  try {
    const response = await fetch(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const postData = await response.json();
    await Data.insertMany(postData);
    res.status(200).send("added successfully");
  } catch (error) {
    res.status(500).send("something went wrong");
  }
};

const getData = async (req, res) => {
  try {
    const { search, pagination, month } = req.query;

    const result = await Data.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
      $expr: { $eq: [{ $month: "$dateOfSale" }, Number(month)] },
    })
      .limit(10)
      .skip(pagination);

    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({
      messege: "something went wrong",
    });
  }
};

const getStats = async (req, res) => {
  const { month } = req.query;
  const result = await Data.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, Number(month)] },
      },
    },
    {
      $group: {
        _id: null,
        totalPrice: { $sum: "$price" },
        totalSold: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
        totalUnSold: {
          $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] },
        },
      },
    },
  ]);
  res.status(200).send(result);
};

const getBarChartData = async (req, res) => {
  const { month } = req.query;
  const result = await Data.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, 6] },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $gte: ["$price", 1] }, { $lt: ["$price", 100] }],
                },
                then: "1-100",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 100] }, { $lt: ["$price", 200] }],
                },
                then: "101-200",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 200] }, { $lt: ["$price", 300] }],
                },
                then: "201-300",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 300] }, { $lte: ["$price", 400] }],
                },
                then: "301-400",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 400] }, { $lte: ["$price", 500] }],
                },
                then: "401-500",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 500] }, { $lte: ["$price", 600] }],
                },
                then: "501-600",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 600] }, { $lte: ["$price", 700] }],
                },
                then: "601-700",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 700] }, { $lte: ["$price", 800] }],
                },
                then: "701-800",
              },
              {
                case: {
                  $and: [{ $gt: ["$price", 800] }, { $lte: ["$price", 900] }],
                },
                then: "801-900",
              },
            ],
            default: "901-above",
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);
  res.status(200).send(result);
};

const getCategory = async (req, res) => {
  const { month } = req.query;
  const result = await Data.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, Number(month)] },
      },
    },
    {
      $group: {
        _id: "$category",
        total: {
          $sum: 1,
        },
      },
    },
  ]);
  res.status(200).send(result);
};

export { postData, getData, getStats, getBarChartData, getCategory };
