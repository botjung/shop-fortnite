require("dotenv").config();

const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function getShop() {
    try {

        const response = await axios.get(
            "https://fortnite-api.com/v2/shop"
        );

        return response.data.data;

    } catch (err) {

        console.log(
            "Error obteniendo tienda:",
            err.message
        );

        return null;
    }
}

async function sendShop(shopData) {

    try {

        const hash = shopData.hash;

        let oldHash = "";

        if (fs.existsSync("lastshop.txt")) {
            oldHash = fs.readFileSync(
                "lastshop.txt",
                "utf8"
            );
        }

        if (hash === oldHash) {

            console.log(
                "La tienda no cambió."
            );

            return;
        }

        fs.writeFileSync(
            "lastshop.txt",
            hash
        );

        const today = new Date()
            .toISOString()
            .split("T")[0];

        const shopImage =
`https://api.nitestats.com/v1/shop/image?language=es`;

        const payload = {

            username: "Fortnite Shop",

            avatar_url:
"https://cdn2.unrealengine.com/fortnite-logo-1920x1080-1920x1080-1e5f2d9b8a33.png",

            content:
`# 🛒 Tienda diaria de Fortnite

📅 ${today}

🔗 https://www.fortnite.com/item-shop`,

            embeds: [
                {
                    title:
"Ver tienda completa",

                    description:
"La tienda diaria ya fue actualizada.",

                    color: 5763719,

                    image: {
                        url: shopImage
                    }
                }
            ]
        };

        await axios.post(
            WEBHOOK_URL,
            payload
        );

        console.log(
            "Tienda enviada correctamente."
        );

    } catch (err) {

        console.log(
            "Error enviando tienda:",
            err.response?.data || err.message
        );
    }
}

async function checkShop() {

    console.log(
        "Revisando tienda..."
    );

    const shop = await getShop();

    if (!shop) return;

    await sendShop(shop);
}

checkShop();

cron.schedule(
    "*/30 * * * *",
    async () => {

        await checkShop();

    }
);
