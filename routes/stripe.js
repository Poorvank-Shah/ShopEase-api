const router = require("express").Router();
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/payment", (req, res) => {
    stripe.paymentIntents.create(
        {
            // source: req.body.tokenId,
            description: `The order amount is ${req.body.amount}`,
            shipping: {
                name: req.body.card.name,
                address: {
                    line1: req.body.card.address_line1,
                    postal_code: req.body.card.address_zip,
                    city: req.body.card.address_city,
                    country: req.body.card.address_country,
                },
            },
            amount: req.body.amount,
            currency: "inr",
            payment_method_types: ['card'],
            payment_method: 'pm_card_visa',
            confirm: true,
        },
        (stripeErr, stripeRes) => {
            if (stripeErr) {
                res.status(500).json(stripeErr);
            }
            else {
                res.status(200).json(stripeRes);
            }
        }
    );
});

router.post("/payment/confirm", (req, res) => {
    console.log(req.body.secret)
    stripe.paymentIntents.confirm(
        req.body.secret,
        {
            payment_method: 'pm_card_visa',

        },
        (stripeErr, stripeRes) => {
            if (stripeErr) {
                res.status(500).json(stripeErr);
            }
            else {
                res.status(200).json(stripeRes);
            }
        }
    );
    console.log(req.body.secret)
})
module.exports = router;