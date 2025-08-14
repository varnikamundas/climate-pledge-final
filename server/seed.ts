import mongoose from 'mongoose';
import Pledge from './models/Pledge.ts';

const uri = 'mongodb+srv://varnika:qwertyy1234@cluster0.jdd4hcl.mongodb.net/?retryWrites=true&w=majority';

const dummyPledges = [
    { name: "Janice Fernandes", email: "janice@example.com", mobile: "1234567890", state: "Maharashtra", profileType: "Working Professional", commitments: ["Energy","Transportation"], date: "15-05-2025" },
    { name: "Amit Singh", email: "amit@example.com", mobile: "8765432109", state: "Uttar Pradesh", profileType: "Student", commitments: ["Transportation"], date: "03-01-2025" },
    { name: "Diya Gupta", email: "diya@example.com", mobile: "7654321098", state: "Karnataka", profileType: "Workshops", commitments: ["Energy","Transportation","Consumption"], date: "19-07-2025" }
];

async function seedDB() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        await Pledge.deleteMany({}); // optional: clear collection first
        await Pledge.insertMany(dummyPledges);

        console.log('Inserted dummy pledges');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

seedDB();
