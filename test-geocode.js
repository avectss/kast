const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'openstreetmap',
    httpAdapter: 'https',
    formatter: null,
    // 👇 Este campo es clave para evitar el baneo
    headers: {
        'User-Agent': 'kastbot/1.0 (admin@kastbot.com)'
    }
};

const geocoder = NodeGeocoder(options);

(async () => {
    const locations = [
        "Tijuana, Mexico",
        "Mexico City, Mexico",
        "Guadalajara, Mexico",
        "Lima, Peru"
    ];

    for (const location of locations) {
        try {
            const res = await geocoder.geocode(location);
            if (res.length > 0) {
                console.log(`✅ ${location}: ${res[0].latitude}, ${res[0].longitude}`);
            } else {
                console.log(`❌ Couldn't geocode ${location}`);
            }
        } catch (err) {
            console.error(`❌ Error geocoding ${location}:`, err.message);
        }
    }
})();
