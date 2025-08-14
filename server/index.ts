import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pledge from './models/Pledge'; // removed .ts so compiled JS works

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000; // Use Render's port or fallback to 5000

app.use(cors());
app.use(express.json());

// Connect to MongoDB using env variable
mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// GET all pledges
app.get('/pledges', async (req, res) => {
    try {
        const pledges = await Pledge.find();
        res.json(pledges);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

// POST a new pledge
app.post('/pledges', async (req, res) => {
    try {
        const newPledge = new Pledge(req.body);
        const savedPledge = await newPledge.save();
        res.json(savedPledge);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
