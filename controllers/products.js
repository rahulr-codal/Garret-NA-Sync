const { createProductVariant, updateProductVariant, bulkUpdateVariants, updateProduct } = require('./bigcommerce')
const processVariants = async (productId, variantsToCreate = [], variantsToUpdate = []) => {
    try {
        for(let variantData of variantsToCreate){
            console.log(`Variant to create: `, variantData);
            let createVariantResponse = await createProductVariant(productId,  variantData)
            console.log("Create Product Variant response: ", createVariantResponse);
        }

        for(let variantData of variantsToUpdate){
            let variantId = variantData.id;
            console.log(`Variant to update: `, variantData);
            let updateVariantResponse = await updateProductVariant(productId, variantId, variantData)
            console.log("Update Proudct Variant response: ", updateVariantResponse);
        }
    } catch (error) {   
        throw error;
    }
};  

module.exports = {
    processVariants
}