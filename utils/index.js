const validateValue = (value, type, charLimit=250) => {
    if(!value && typeof value != "boolean"){ return null };
    if(!value && type == "string"){
        return ""
    }
    if(type == "string"){
        value = value.toString().trim().slice(0, charLimit); 
    }
    return value;
}

const titleCase = (str) => {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

module.exports = {
    validateValue,
    titleCase
}