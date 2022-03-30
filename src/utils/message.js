const generateMessage = (username,test)=>{
    return {
        username,
        test,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage
}