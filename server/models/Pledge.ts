import mongoose, { Schema, Document } from 'mongoose';

export interface IPledge extends Document {
    name: string;
    email: string;
    mobile: string;
    state: string;
    profileType: 'Student' | 'Working Professional' | 'Workshops' | 'Other';
    commitments: ('Energy' | 'Transportation' | 'Consumption')[];
    date: string;
}

const PledgeSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    state: { type: String },
    profileType: { type: String, enum: ['Student', 'Working Professional', 'Workshops', 'Other'], required: true },
    commitments: [{ type: String, enum: ['Energy', 'Transportation', 'Consumption'] }],
    date: { type: String, required: true }
});

export default mongoose.model<IPledge>('Pledge', PledgeSchema);
