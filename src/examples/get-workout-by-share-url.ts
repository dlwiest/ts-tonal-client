require('dotenv').config();
import { TonalClient } from '../client';

const getWorkoutByShareUrl = async (shareUrl: string) => {
    try {
        const client = await TonalClient.create({ username: process.env.TONAL_USERNAME!, password: process.env.TONAL_PASSWORD! });
        const workout = await client.getWorkoutByShareUrl(shareUrl);
        console.log(workout);
    } catch (e) {
        console.error(e);
    }
};

// Example usage: Pass the share URL as a command line argument
const shareUrl = process.argv[2];
if (!shareUrl) {
    console.error('Please provide a share URL as the parameter');
    process.exit(1);
}

getWorkoutByShareUrl(shareUrl);
