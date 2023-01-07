const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const Order = require("../models/Order");
const { verifyTokenAndAuthorization, verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

// CREATE

router.post("/", verifyToken, async (req, res) => {
    const newOrder = new Order(req.body);

    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

// UPDATE 
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        }, { new: true });
        res.status(200).json(updatedOrder);
    }
    catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        // await Order.deleteMany({createdAt : {$gte: '2023-01-01T09:58:41.452+00:00'}});
        res.status(200).json("Order has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER ORDERS
router.get("/find/:userId", async (req, res) => {
    try {
        // console.log(`${req.params.userId}`)
        var mongooseObjectId = mongoose.Types.ObjectId(`${req.params.userId}`);
        const orders = await Order.find({ userId: mongooseObjectId });
        // const orders = await Order.find({ userId: req.params.userId });

        // console.log(orders);
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ORDERS OF ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate("userId");
        // console.log(orders);
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// STATS MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    const productId = req.query.pid;
    try {
        const income = await Order.aggregate([
            // IIMMPP  HOW TO CREATE CONIDTIONAL OBJECT 
            {
                $match: {
                    createdAt: { $gte: previousMonth }, ...(productId && {
                        products: { $elemMatch : { productId } }
                    })
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    year: {$year: "$createdAt"},
                    sales: "$amount", // "$amount"
                },
            },
            {
                $group: {
                     _id: ["$year","$month"],
                    total: { $sum: "$sales" },
                },
            },
         ]).sort({ _id: 1 });
        res.status(200).json(income);
    }
    catch (err) {
        res.status(500).json(err);
    }
});

// USER Transaction
router.get("/transaction", verifyTokenAndAdmin, async (req, res) => {

    // var id = mongoose.Types.ObjectId(`${req.params.id}`);
    try {
        const data = await Order.aggregate([
            {
                $group:
                {
                    // _id : "mongoose.Types.ObjectId($userId)",
                    _id: "$userId",
                    total: { $sum: "$amount" },
                },
            },
        ]);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
