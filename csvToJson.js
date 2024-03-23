const fs = require('fs');
const path = require('path');

// Function to convert CSV to JSON
function csvToJson(csv) {
    const lines = csv.split('\n');
    let headers = lines[0].split(',');
    headers[headers.length - 1] = 'cert';
    const result = [];
    let levels = {
        'DOC. DIR. EXTRACURRICULAR': 0,
        'EDUCACION MEDIA BASICA': 1,
        'FORMACIÓN PROFESIONAL': 1,
        'EDUC. SUPERIOR TERCIARIA': 3,
        'CAPACITACIONES': 1,
        'EDUCACION MEDIA SUPERIOR': 2,
        'CURSO TÉCNICO TERCIARIO - AUDIOVISUAL PRODUCCIÓN DIRECCIÓN DE ARTE Y GUIÓN': 3,
        '"CAPACITACIÓN PROFESIONAL INICIAL - TELAR ALTO': 1,
        'FIGURAS EDUCATIVAS N/C': 2,
        'APOYO A LA GESTION': 0,
    };

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');
        // console.log(currentline);

        for (let j = 0; j < headers.length; j++) {
            // Convert numeric values with commas as decimal points
            const value = currentline[j].replace(',', '.');
            if (j === 6 && isNaN(Number(value))) {
                console.log(`Error: ${currentline.join(",")} is not a number`);
            }
            obj[headers[j]] = isNaN(Number(value)) || value == "" || value == " " || value == "\r" ? value.trim() : Number(value);
        }
        const level = currentline[4].trim();
        obj['nivel'] = levels[level];

        result.push(obj);
    }
    console.log(Object.keys(levels));

    return JSON.stringify(result, null, 2); // Pretty print the JSON
}

// Path to the CSV file
const filePath = path.join(__dirname, 'oferta-cursos.csv');
const jsonFilePath = path.join(__dirname, 'oferta-cursos.json');

// Read the CSV file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Convert the CSV data to JSON
    const json = csvToJson(data);

    fs.writeFile(jsonFilePath, json, 'utf8', (err) => {
        if (err) {
            console.error('Error writing JSON to file:', err);
            return;
        }

        console.log('JSON saved to', jsonFilePath);
    });
});
