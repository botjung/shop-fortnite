require("dotenv").config();

const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function getShop() {
    try {
        const response = await axios.get("https://fortnite-api.com/v2/shop/br");
        return response.data.data;
    } catch (err) {
        console.log("Error obteniendo tienda:", err.message);
        return null;
    }
}

async function sendShop(shopData) {
    try {

        const hash = shopData.hash;

        let oldHash = "";

        if (fs.existsSync("lastshop.txt")) {
            oldHash = fs.readFileSync("lastshop.txt", "utf8");
        }

        if (hash === oldHash) {
            console.log("La tienda no cambió.");
            return;
        }

        fs.writeFileSync("lastshop.txt", hash);

        const payload = {
            username: "Fortnite Shop",
            embeds: [
                {
                    title: "🛒 Tienda diaria de Fortnite",
                    description: "La tienda fue actualizada.",
                    color: 5763719,
                    image: {
                        url: shopData.image
                    }
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 5,
                            label: "Ver tienda completa",
                            url: "https://www.fortnite.com/item-shop"
                        }
                    ]
                }
            ]
        };

        await axios.post(WEBHOOK_URL + "?wait=true", payload);

        console.log("Tienda enviada correctamente.");

    } catch (err) {
        console.log("Error enviando tienda:", err.message);
    }
}

async function checkShop() {

    console.log("Revisando tienda...");

    const shop = await getShop();

    if (!shop) return;

    await sendShop(shop);
}

checkShop();

cron.schedule("*/30 * * * *", async () => {
    await checkShop();
});
