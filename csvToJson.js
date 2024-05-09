const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'cursosInfoUpdated.csv'); // Update the path to your CSV file

csv({
    delimiter: "#", // Set delimiter as `#` since your CSV uses `#` to separate fields
    noheader: true,
    headers: [
        "tipoDeCurso",
        "plan",
        "nombre",
        "nombrePublico",
        "nivelEducativo",
        "tipo",
        "creditosEducativos",
        "horasSemanales",
        "horasTotales",
        "certificacion",
        "nivel",
        "url",
        "descripcion",
        "localidad",
        "coordenadas"
    ],
    checkType: true
})
    .fromFile(csvFilePath)
    .then((jsonObj) => {
        console.log(jsonObj); // Output the JSON object to console

        // Optionally, write the JSON to a file
        fs.writeFile('output.json', JSON.stringify(jsonObj, null, 4), (err) => {
            if (err) {
                console.log('Error writing JSON to file:', err);
            } else {
                console.log('Successfully written JSON to file.');
            }
        });
    });
