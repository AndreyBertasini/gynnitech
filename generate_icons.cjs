const sharp = require('sharp');
const fs = require('fs');

async function generate() {
    const inputFile = './public/apple-touch-icon.png';

    if (!fs.existsSync(inputFile)) {
        console.log("No apple-touch-icon.png found");
        return;
    }

    try {
        // Genero icona PNG 48x48
        await sharp(inputFile)
            .resize(48, 48)
            .toFile('./public/favicon-48x48.png');
        console.log("Generated favicon-48x48.png");

        // Genero icona PNG 96x96
        await sharp(inputFile)
            .resize(96, 96)
            .toFile('./public/favicon-96x96.png');
        console.log("Generated favicon-96x96.png");

        // Rimuovo il vecchio svg (che ho inavvertitamente corrotto/creato prima) e il vecchio ico
        if (fs.existsSync('./public/favicon.svg')) fs.unlinkSync('./public/favicon.svg');
        if (fs.existsSync('./public/favicon.ico')) fs.unlinkSync('./public/favicon.ico');

        console.log("Deleted old favicon.svg and favicon.ico");
    } catch (err) {
        console.error(err);
    }
}

generate();
