const validateValue = (value, type, charLimit=250) => {
    if(!value){
        if(typeof value == "boolean" || type == "boolean"){
            return "false";
        }else if(type == "string"){
            return "";
        }else{
            return null;
        }
    }
    if(type == "string"){
        value = value.toString().trim().slice(0, charLimit); 
    }
    return value.toString().replace(/&#13;/g, '');
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