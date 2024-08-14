import { fetchData } from "../helper/data-fetch.js";
import Data from "../model/data.model.js";

const postData = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Data.insertMany(data);
    res.status(200).send("added successfully");
  } catch (error) {
    res.status(500).send("something went wrong");
  }
};

const getData = async (req, res) => {
  try {
    const { search = "", month = 3 } = req.query;

    const result = await Data.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });

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
    {
      $sort: {
        _id: 1,
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

const getCombinedData = async (req, res) => {
  const { search = "", month = 3 } = req.query;
  const tableData = await fetchData(
    `https://roxiler-backend-hx6o.onrender.com/api/get-data?month=${month}&search=${search}`
  );
  const barChartData = await fetchData(
    `https://roxiler-backend-hx6o.onrender.com/api/get-barchart-data?month=${month}`
  );
  const statsData = await fetchData(
    `https://roxiler-backend-hx6o.onrender.com/api/get-stats?month=${month}`
  );
  const pieChartData = await fetchData(
    `https://roxiler-backend-hx6o.onrender.com/api/get-categories?month=${month}`
  );

  res.status(200).json({
    tableData,
    barChartData,
    statsData,
    pieChartData,
    name: "hello",
  });
};

export {
  postData,
  getData,
  getStats,
  getBarChartData,
  getCategory,
  getCombinedData,
};
