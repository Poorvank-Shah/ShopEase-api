const User = require("../models/User");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

// UPDATE 
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {

    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC).toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        }, { new: true })
        res.status(200).json(updatedUser);
    }
    catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;                            // new is here name of query you can have any
    try {
        const users = query
            ? await User.find().sort({ _id: -1 }).limit(5)
            : await User.find();

        //BBBYYY MMMEEE NOT SHOW PASSWORD
        let allusers = [];                                                 // use let not const
        users.map((user) => {
            const { password, ...others } = user._doc;
            allusers = [...allusers, others];
        })

        res.status(200).json(allusers);
        // res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json(err);
    }
});

// USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project:
                {
                    month: { $month: "$createdAt" },
                    year: {$year: "$createdAt"}
                },
            },
            {
                $group: 
                {
                    id: ["$year", "$month"],
                    total: { $sum: 1 },
                },
            },
        ]).sort({ _id: 1 });
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;
