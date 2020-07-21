const express = require("express");
const app = express();
const purchaseDate = new Date().toISOString();

app.use(express.json());

app.post("/billReceipt", (req, res) => {

    //Initialize the response JSON structure.
    const receipt = {
        purchasedDateAndTime: purchaseDate.replace(/[TZ]/g, " "),
        items: [],
        totalPrice: 0,
        totalPayableAfterDiscount: 0,
    }
    const purchasedItems = req.body;
    try {
        purchasedItems.forEach((item) => {
            let itemWithFinalPrice = {
                price: {}
            };
            let taxAmount = 0;
            if (item.itemCategory.toLowerCase() === "medicine" || item.itemCategory.toLowerCase() === "food") {
                taxAmount = (item.quantity * item.price * 0.05);
            } else if (item.itemCategory.toLowerCase() === "clothes") {
                if (itemWithFinalPrice.finalPrice < 1000) {
                    taxAmount = (item.quantity * item.price * 0.05);
                } else {
                    taxAmount = (item.quantity * item.price * 0.12);
                }
            } else if (item.itemCategory.toLowerCase() === "music") {
                taxAmount = (item.quantity * item.price * 0.03);
            } else if (item.itemCategory.toLowerCase() === "imported") {
                taxAmount = (item.quantity * item.price * 0.18);
            }
            itemWithFinalPrice.itemCategory = item.itemCategory;
            itemWithFinalPrice.itemName = item.item;
            itemWithFinalPrice.quantity = item.quantity;
            itemWithFinalPrice.price.pricePerItem = item.price;
            itemWithFinalPrice.price.totalPriceExcludingTax = (item.quantity * item.price);
            itemWithFinalPrice.price.taxAmount = taxAmount;
            itemWithFinalPrice.price.totalPriceIncludingTax = itemWithFinalPrice.price.totalPriceExcludingTax + itemWithFinalPrice.price.taxAmount;
            receipt.totalPrice = receipt.totalPrice + itemWithFinalPrice.price.totalPriceIncludingTax;
            receipt.items.push(itemWithFinalPrice);
        })

        if (receipt.totalPrice > 2000) {
            receipt.totalPayableAfterDiscount = receipt.totalPrice - (receipt.totalPrice * 0.05);
        }
        res.status(200).send(receipt);
    } catch (e) {
        res.status(500).send(e)
    }

})


app.listen(3000, () => {
    console.log("Listening to PORT: 3000");
});