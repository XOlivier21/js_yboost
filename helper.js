/*
const success =(message, data) =>{
    return {
        message: message,
        data: data
    }
}

module.exports = success;
*/
/*
exports.success = (message, data) => {
    return {
        message: message,
        data: data
    }
}
*/
exports.success = (message, data) => {
    return {message, data};
};
