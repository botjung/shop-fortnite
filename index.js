require("dotenv").config();

const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function getShop() {
    try {
        const response = await axios.get("https://fortnite-api.com/v2/shop");
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

        const shopImage =
`https://bot.fnbr.co/shop-image/fnbr-shop-${hash}.png`;

        const payload = {
            username: "Fortnite Shop",

            avatar_url:
"https://cdn2.unrealengine.com/fortnite-logo-1920x1080-1920x1080-1e5f2d9b8a33.png",

            content:
`# 🛒 Tienda diaria de Fortnite

## 🔗 Ver tienda oficial
https://www.fortnite.com/item-shop`,

            embeds: [
                {
                    title: "Tienda actualizada",
                    description:
"Ya está disponible la nueva tienda diaria.",

                    color: 5763719,

                    image: {
                        url: shopImage
                    },

                    footer: {
                        text: "Actualización automática"
                    }
                }
            ]
        };

        await axios.post(WEBHOOK_URL, payload);

        console.log("Tienda enviada correctamente.");

    } catch (err) {

        console.log(
            "Error enviando tienda:",
            err.response?.data || err.message
        );
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
