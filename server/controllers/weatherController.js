import redis from 'redis';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

const CACHE_EXPIRATION_TIME = 600;

const getWeather = async (req, res) => {
    const location = req.params.location;
    const apiKey = process.env.VISUAL_CROSSING_API_KEY;
    //connects to redis clients
    await redisClient.connect();
    try {
        // Check if data exists in Redis cache
        const cachedData = await redisClient.get(location);

        if (cachedData) {
            console.log(`Serving cached data for ${location}`);
            return res.json(JSON.parse(cachedData)); // Send cached data
        }

        // If not in cache, make the API call
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${apiKey}`;

        const response = await axios.get(url);
        const weatherData = response.data;

        // Store response in Redis cache with expiration
        await redisClient.setEx(location, CACHE_EXPIRATION_TIME, JSON.stringify(weatherData));

        // Extract and send the data
        const currentConditions = weatherData.currentConditions;
        const forecast = weatherData.days;

        res.json({
            location: location,
            temperature: `${currentConditions.temp} °C`,
            humidity: `${currentConditions.humidity} %`,
            conditions: currentConditions.conditions,
            forecast: forecast
        });
    } catch (err) {
        console.error('Error fetching weather data:', err.message);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
};

export { getWeather };
