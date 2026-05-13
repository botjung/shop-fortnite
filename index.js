require("dotenv").config();
        if (fs.existsSync("lastshop.txt")) {
            oldHash = fs.readFileSync("lastshop.txt", "utf8");
        }

        if (hash === oldHash) {
            console.log("La tienda no cambió.");
            return;
        }

        fs.writeFileSync("lastshop.txt", hash);

        const image = shopData.image;

        const payload = {
            username: "Fortnite Shop",
            avatar_url: "https://cdn2.unrealengine.com/fortnite-logo-1920x1080-1920x1080-1e5f2d9b8a33.png",
            embeds: [
                {
                    title: "🛒 Tienda diaria de Fortnite",
                    description: "La tienda ha sido actualizada.",
                    color: 5763719,
                    image: {
                        url: image
                    },
                    footer: {
                        text: "Actualización automática"
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

        await axios.post(WEBHOOK_URL, payload);

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

cron.schedule("*/30 * * * *", () => {
    checkShop();
});
