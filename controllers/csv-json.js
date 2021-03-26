const csv = require("csvtojson")

const csvFileToJSON = async (filePath) => {
    return await csv().fromFile(filePath);
};

module.exports = {
    csvFileToJSON
}