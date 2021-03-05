const axios = require("axios");
const Headers = {
    'X-Auth-Token': process.env.BIG_COMMERCE_ACCESS_TOKEN
};
const BaseURL = process.env.BIG_COMMERCE_BASE_URL

//  =========================== Products ========================= //

const listProduct = async (params={}) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products`,
          method: 'get',
          params: params,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const getProduct = async (productId, params={}) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}`,
          method: 'get',
          params: params,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const createProduct = async (data) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products`,
          method: 'post',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const updateProduct = async (productId, data) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}`,
          method: 'put',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}


//  =========================== Product Metafield ========================= //
const createProductMetafield = async (productId, data) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/metafields`,
          method: 'post',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const listProductMetafield = async (productId, params={}) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/metafields`,
          method: 'get',
          params: params,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const updateProductMetafield = async ( productId, metafieldId, data ) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/metafields/${metafieldId}`,
          method: 'put',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}


//  =========================== Categories ========================= //
const createCategory = async (data) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/categories`,
          method: 'post',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;
    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const listCategory = async (params) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/categories`,
          method: 'get',
          params: params,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;
    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const listCategoryTree = async (data) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/categories/tree`,
          method: 'get',
        //   data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;
    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}


// ============================ Product Variants ======================= //
const createProductVariant = async ( productId, data ) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/variants`,
          method: 'post',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const updateProductVariant = async ( productId, variantId, data ) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/variants/${variantId}`,
          method: 'put',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

const bulkUpdateVariants = async ( data ) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/variants`,
          method: 'put',
          data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;

    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

// ============================ Product Options ======================= //
const listProductOptions = async (productId, params) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/options`,
          method: 'get',
        //   data: data,
          headers: Headers
        }
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;
    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
}

// ============================ Images ==================================== //
const createVariantImage = async (productId, variantId, data) => {
    try {
        let options = {
          url: `${BaseURL}/v3/catalog/products/${productId}/variants/${variantId}/image`,
          method: 'post',
          data: data,
          headers: { ...Headers, "content-type": "multipart/form-data", ...data.getHeaders()}
        }
        console.log("options", options)
        let response = await axios.request(options);
        // console.log(response);
        return (response.data && response.data.data) || response.data;
    } catch (error) {
        console.log(error)
        if(error.response && error.response.data){
            console.log(error.response.data)   
        }else{
            console.log(error)
        }
    }
};

module.exports = {
    listProduct,
    getProduct,
    createProduct,
    updateProduct,
    //
    listCategory,
    createCategory, 
    listCategoryTree,
    //
    listProductMetafield,
    createProductMetafield,
    updateProductMetafield,
    //   
    createProductVariant,
    updateProductVariant,
    bulkUpdateVariants,
    // 
    listProductOptions,
    // 
    createVariantImage
}