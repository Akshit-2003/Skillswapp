const mongoose = require('mongoose');

const signalPayloadSchema = new mongoose.Schema({
    fromEmail: { type: String, default: '' },
    toEmail: { type: String, default: '' },
    attemptId: { type: String, default: '' },
    payload: { type: mongoose.Schema.Types.Mixed, default: null },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const iceCandidateSchema = new mongoose.Schema({
    fromEmail: { type: String, default: '' },
    toEmail: { type: String, default: '' },
    attemptId: { type: String, default: '' },
    candidate: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
    sessionType: { type: String, default: 'swap' },
    learnerEmail: { type: String, required: true },
    learnerName: { type: String, required: true },
    mentorEmail: { type: String, default: '' },
    mentorName: { type: String, default: '' },
    skill: { type: String, required: true },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    skillRequestProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    skillRequestProviderEmail: { type: String, default: '' },
    skillRequestRawSkill: { type: String, default: '' },
    scheduledByEmail: { type: String, default: '' },
    scheduledByName: { type: String, default: '' },
    reviewCompletedAt: { type: Date, default: null },
    chat: [{
        sender: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    call: {
        attemptId: { type: String, default: '' },
        offer: { type: signalPayloadSchema, default: null },
        answer: { type: signalPayloadSchema, default: null },
        iceCandidates: { type: [iceCandidateSchema], default: [] },
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
