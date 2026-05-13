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

        const today = new Date();

        const fecha = today.toLocaleDateString(
            "es-MX",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

        // Imagen oficial de Fortnite-API
        const shopImage = shopData.imageUrl;

        const payload = {

            username: "Fortnite Item Shop",

            avatar_url:
"https://imgur.com/IVM8VaD.png",

            embeds: [
                {
                    title:
"🛒 Tienda Diaria de Fortnite",

                    description:
`📅 **${fecha}**

✨ La tienda ya fue actualizada.

🔗 [Ver tienda oficial](https://www.fortnite.com/item-shop)`,

                    color: 5763719,

                    image: {
                        url: shopImage
                    },

                    footer: {
                        text:
"Actualización automática • Powered by Fortnite-API.com"
                    },

                    timestamp: new Date()
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

// Revisar al iniciar
checkShop();

// Revisar cada 30 minutos
cron.schedule(
    "*/30 * * * *",
    async () => {

        await checkShop();

    }
);
     
