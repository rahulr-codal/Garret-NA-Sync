if(process.env.NODE_ENV == "development"){
    require('dotenv').config();
}

const csv = require("csvtojson")
const { processVariants }  = require('./controllers/products');
const { 
    getProduct,
    listProduct,
    createProduct, 
    updateProduct,
    createProductMetafield, 
    listProductMetafield,
    updateProductMetafield,
    listProductOptions
} = require('./controllers/bigcommerce');
const { convertToBigCProduct, generateMetafields } = require("./utils/convert")

async function main() {
    const productArr = await csv().fromFile("./csv/productsSS21.csv");
    const productVarient = await csv().fromFile("./csv/variantsSS21.csv");
    const productPrice = await csv().fromFile("./csv/fw20prices.csv");
    for (let product of productArr) {
        console.log("Syncing Product -> ", product["ID"]);
        
        const pVarient = productVarient.filter(
            (i) => i["product-id"] == product["ID"]
        );
        const pPrices = productPrice.filter(
            (i) => i["product-id"] == product["ID"]
        );
        console.log(product);
        product["variants"] = pVarient;
        product["prices"] = pPrices;

        let bigCProductJSON = await convertToBigCProduct(product);
        let metafieldsToCreate = generateMetafields(product);
        let { sku } = bigCProductJSON;
        let productId = null;
        let existingMetafields = [];
        
        let isExisting = await listProduct({ sku: sku, include: "custom_fields, variants" });
        isExisting = isExisting.length ? isExisting[0] : null;
        if(isExisting){
            let bigCProduct = isExisting;
            let existingCustomFields = bigCProduct.custom_fields || [];
            let existingVariants = bigCProduct.variants || [];
            productId = bigCProduct.id;
            // console.log(bigCProduct);
            existingMetafields = await listProductMetafield(productId);
            // console.log(existingMetafields);
            bigCProductJSON.custom_fields = bigCProductJSON.custom_fields.map( obj => {
                let existingCustomField = existingCustomFields.find(cf => cf.name == obj.name);
                if(existingCustomField) { obj.id = existingCustomField.id };
                return obj; 
            });

            let variantsToUpdate = [];
            let variantsToCreate = [];

            bigCProductJSON.variants.forEach((obj, i) => {
                let existingVariant = existingVariants.find(ev => ev.sku == obj.sku);
                if(existingVariant){ 
                    obj.id = existingVariant.id;
                    variantsToUpdate.push(obj);
                }else{
                    variantsToCreate.push(obj);
                }
            });

            // update the product 
            let updateProductPayload = Object.assign({}, bigCProductJSON);
            delete updateProductPayload.variants;
            console.log("Update product payload: ", JSON.stringify(updateProductPayload));
            let updateResponse = await updateProduct(productId, updateProductPayload);
            console.log("Update Product Response: ", updateResponse);

            // process variants
            await processVariants(productId, variantsToCreate, variantsToUpdate);
        }else{
            let response = await createProduct(bigCProductJSON);
            console.log("bigcomm response: ", response);
            productId = response.id;
        }

        // create or update metafields
        for(let [key, value] of Object.entries(metafieldsToCreate)){
            let obj = {
                key: key,
                namespace: "Product Details",
                permission_set: "read_and_sf_access",
                value: typeof value == "object" ? JSON.stringify(value): value,   
            }
            let existingMetafieldKey = existingMetafields.find(em => em.key == key)
            if(existingMetafieldKey){
                let metafieldId = existingMetafieldKey.id;
                let updateMetafieldResponse = 
                    await updateProductMetafield(productId, metafieldId, obj);
                console.log("Update metafield response: ", updateMetafieldResponse);
            }else{
                let createMetafieldResponse = await createProductMetafield(productId, obj);
                console.log("Create metafield response: ", createMetafieldResponse);
            }
        }
    }
}

main()