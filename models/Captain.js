const mongoose = require('mongoose');

const CaptainSchema = new mongoose.Schema({
    captainId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    
    sport: { type: String, required: true },
    teamName: { type: String, required: true },
    
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },

    players: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
            name: String,
            position: String,
            year: Number,
            department: String
        }
    ],

    tournaments: [
        {
            tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
            name: String,
            year: Number,
            status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' }
        }
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Captain', CaptainSchema);
