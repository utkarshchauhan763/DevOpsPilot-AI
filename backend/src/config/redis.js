const Redis = require("ioredis");
const config = require("./env");

const redis = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    maxRetriesPerRequest: null,
    lazyConnect: true
});

redis.on("connect",()=>{
    console.log("Redis connection established");
});

redis.on("ready",()=>{
    console.log("Redis is ready");
});

redis.on("error",(error)=>{
    console.log("Redis connection error:", error.message);
});

const connectRedis = async() => {
    if(redis.status === "wait"){
        await redis.connect();
        return;
    }
    if(redis.status === "ready"){
        return;
    }

    await new Promise((resolve,reject)=>{
        redis.once("ready",resolve);
        redis.once("error",reject);
    });
    
};

module.exports = {
    redis,
    connectRedis
};