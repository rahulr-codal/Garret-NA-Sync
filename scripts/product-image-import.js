if(process.env.NODE_ENV == "development"){
    require('dotenv').config();
}
const fs = require('fs');
const FormData = require('form-data')
const { createVariantImage, listProduct } = require("../controllers/bigcommerce");
const { getColorName } = require("../utils/convert");
const { count } = require('console');
const ProductFolder = `${__dirname}/../product-images`;

const main = async () => {
    try {
        // get product images
        let images = fs.readdirSync(ProductFolder);
        for(let file of images) {
            let bodyFormData = new FormData();
            let imagePath = ProductFolder + "/" + file;
            bodyFormData.append('image_file', fs.createReadStream(imagePath))
            console.log(bodyFormData)
            // 1007759901_2
            console.log(imagePath);
            // break
            // identify the product variant where it goes
            let imageNameArr = file.split("_");
            let colorCode = imageNameArr[0].slice(-4);
            let colorName = getColorName(colorCode);
            let productSKU = imageNameArr[0].slice(0, imageNameArr[0].length - 4);
            console.log("colorCode", colorCode, "productSKU", productSKU) 
            let imageNumber = imageNameArr[1] || "";
            if(imageNumber.includes("o")){
                console.log("Image belongs to model");
            }
            let isExisting = await listProduct({ sku: productSKU, include: "variants" });
            isExisting = isExisting.length ? isExisting[0] : null;
            if(isExisting && colorName){
                let productId = isExisting.id;
                console.log(isExisting.variants[0].option_values);
                // filter variant based on color code
                let filteredVariants = isExisting.variants
                    .filter(v => v.option_values.some(op => op.label == colorName));
                console.log("filteredVariants:", JSON.stringify(filteredVariants, null, 2));
                let imagePayload = { image_file: imagePath };
                for(let variant of filteredVariants){
                    await createVariantImage(productId, variant.id, bodyFormData);
                }
            }
            // break;
        }
        // push or update to bigcommerce
    } catch (error) {
        throw error;
    }
};


main();