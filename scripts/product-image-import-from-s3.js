const AWS = require("aws-sdk");
if(process.env.NODE_ENV == "development"){
    require('dotenv').config();
}
AWS.config.update({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET
});
const s3 = new AWS.S3();
const BucketName = process.env.AWS_S3_IMAGE_BUCKET;
const ImageDir = process.env.AWS_S3_IMAGE_DIR;
const ImagePublicURLBase = `https://${BucketName}.s3.amazonaws.com/${ImageDir}`;
const { createProductImage, updateProductImage, listProduct } = require("../controllers/bigcommerce");
const { getColorName } = require("../utils/convert");

const validateJson = (data) => {
    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (e) {
        console.log(e.message);
        jsonData = data;
    }
    return jsonData;
};

const getAllImages = async () => {
    try {
        let params = {
            Bucket: BucketName,
            Prefix: ImageDir,
        };
        let allImages = [];
        // loop through all keys and get all
        let isTruncated = true;
        while(isTruncated){
            const result = await s3.listObjectsV2(params).promise();
            console.log(result);
            let images = result.Contents;
            allImages = allImages.concat(images);
            isTruncated = result.IsTruncated;
            if(isTruncated){
                params.ContinuationToken = result.NextContinuationToken;
            }
        }
        return allImages;
    } catch (error) {
        throw error;
    }
};

const main = async () => {
    try {
        // get product images
        let images = await getAllImages();
        console.log(images.length);
        images = images.filter(i => i["Key"] != ImageDir);
        const productImagesObj = {};
        for(let image of images) {
            let imageName = image["Key"].split("/").pop();
            let imageNameArr = imageName.split("_");
            let colorCode = imageNameArr[0].slice(-4);
            let colorName = getColorName(colorCode);
            let productSKU = imageNameArr[0].slice(0, imageNameArr[0].length - 4);
            // console.log("colorCode", colorCode, "productSKU", productSKU) 
            let imageNumber = (imageNameArr[1] || "").replace(/\.\w+/g, "");
            let imageURL = `${ImagePublicURLBase}${imageName}`.replace(/\s+/g, "%20");
            let imageObj = {
                url: imageURL,
                colorName: colorName,
                colorCode: colorCode,
                number: imageNumber,
                isModel: false
            };
            if(imageNumber.includes("o")){
                // console.log("Image belongs to model");
                imageObj.isModel = true;
            }
            if(productImagesObj[productSKU]){
                productImagesObj[productSKU].push(imageObj);
            }else{
                productImagesObj[productSKU] = [imageObj];   
            }
        }

        // push or update to bigcommerce
        for(let productSKU of Object.keys(productImagesObj)){
            console.log("=================Product SKU====================:\n", productSKU);
            let productImages = productImagesObj[productSKU];
            let isExisting = await listProduct({ sku: productSKU, include: "images" });
            isExisting = isExisting.length ? isExisting[0] : null;
            if(isExisting){
                let productId = isExisting.id;
                let existingImages = isExisting.images;
                // console.log("existingImages:", existingImages);
                // get object of existing images with key as colorCode_number
                existingImages = existingImages.map((o) => {
                    let data = validateJson(o.description);
                    if(typeof data == "object"){
                        return { id: o.id, ...data };
                    }
                    return { id: o.id };
                });

                let colorCodeNumberImageObj = existingImages.reduce((acc, obj) => {
                    let key = [obj.colorCode, obj.number].join("_");
                    acc[key] = obj.id
                    return acc;
                }, {})
                console.log("colorCodeNumberImageObj:", colorCodeNumberImageObj)
                // return;
                for(let productImage of productImages){
                    let { url, ...imageDetails } = productImage;
                    // console.log("image details: ", imageDetails);
                    let isThumbnail = false;
                    if(imageDetails.number == "1" || imageDetails.number == "01" ){
                        isThumbnail = true;
                    }
                    let imagePayload = {
                        image_url: url,
                        is_thumbnail: isThumbnail,
                        description: JSON.stringify(imageDetails),
                    };
                    console.log("Image payload:", imagePayload);
                    // check if existing or not
                    let colorCodeNumber =  imageDetails.colorCode + "_" + imageDetails.number;
                    if(colorCodeNumberImageObj[colorCodeNumber]){
                        let imageId = colorCodeNumberImageObj[colorCodeNumber];
                        let response = await updateProductImage(productId, imageId, imagePayload);
                        console.log("Update Product Image Response: ", response);
                    }else{
                        let response = await createProductImage(productId, imagePayload);
                        console.log("Create Product Image Response: ", response);
                    }
                    console.log("\n-----------------------------------------------------------------------------------\n");
                }
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};


main();