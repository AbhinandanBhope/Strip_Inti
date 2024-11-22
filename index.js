const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const app = express();

const Publishable_Key = "";
const Secret_Key = "";

const stripe = require("stripe")(Secret_Key);

const port = process.env.PORT || 3000;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("home", {
        key: Publishable_Key
    });
});

app.get("/success", function (req, res) {
    res.send("Payment Successful!");
});

app.get("/cancel", function (req, res) {
    res.send("Payment Cancelled.");
});

// Handle payment request
app.post("/payment", async function (req, res) {
    const amount = req.body.amount; // Assuming amount is in paise (INR smallest unit)
    
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).send("Invalid amount");
    }

    try {
        // Creating a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Define payment methods you want to accept
            line_items: [
                {
                    price_data: {
                        currency: 'inr', // Currency
                        product_data: {
                            name: 'Handmade Art and Craft Product', // Product name
                        },
                        unit_amount: amount, // The amount (in paise/cents)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Payment mode
            success_url: 'http://localhost:3000/success', // Success URL
            cancel_url: 'http://localhost:3000/cancel', // Cancel URL
        });

        // Return the session ID to the client to initiate the payment
        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, function (error) {
    if (error) throw error;
    console.log("Server created Successfully on port", port);
});
