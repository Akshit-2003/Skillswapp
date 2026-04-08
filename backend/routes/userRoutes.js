const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userController = require('../controllers/userController');
const User = require('../models/User'); // User model import karna zaroori hai
const Message = require('../models/Message'); // Unread messages check karne ke liye
const Session = require('../models/Session'); // Real-time sessions database map karne ke liye
const Rating = require('../models/Rating'); // Rating model for session feedbacks
const { normalizeSkillName } = require('../utils/skillHelpers');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-avatar-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

const createAttemptId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getSanitizedCallState = (session, viewerEmail) => {
    const rawSession = typeof session?.toObject === 'function' ? session.toObject() : session;
    const callState = rawSession?.call || {};
    const iceCandidates = Array.isArray(callState.iceCandidates) ? callState.iceCandidates : [];

    return {
        attemptId: callState.attemptId || '',
        offer: callState.offer && (!callState.offer.toEmail || callState.offer.toEmail === viewerEmail) ? callState.offer : null,
        answer: callState.answer && (!callState.answer.toEmail || callState.answer.toEmail === viewerEmail) ? callState.answer : null,
        iceCandidates: iceCandidates.filter(candidate => {
            const matchesViewer = !candidate.toEmail || candidate.toEmail === viewerEmail;
            const matchesAttempt = !callState.attemptId || !candidate.attemptId || candidate.attemptId === callState.attemptId;
            return matchesViewer && matchesAttempt;
        }),
        startedAt: callState.startedAt || null,
        endedAt: callState.endedAt || null
    };
};

router.get('/profile', userController.getProfile);
router.post('/updateProfile', userController.updateProfile);
router.get('/messages', userController.getMessages);

// Request Swap & Schedule Session
router.post('/swapRequests', async (req, res) => {
    try {
        const { email, skillName, date, time, mentorEmail, mentorName } = req.body;
        const [user, mentor] = await Promise.all([
            User.findOne({ email }),
            mentorEmail ? User.findOne({ email: mentorEmail }) : null
        ]);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!mentor || mentor.role === 'Teacher Admin' || mentor.role === 'Main Admin' || mentor.role === 'Super Admin') {
            return res.status(400).json({ message: 'Selected teacher is invalid.' });
        }
        if (!skillName || !date || !time || !mentorEmail) {
            return res.status(400).json({ message: 'skillName, mentorEmail, date, and time are required.' });
        }

        const hasApprovedSkill = (mentor.skillsOffered || []).some(
            (skill) => !skill.includes('[Pending Approval') && normalizeSkillName(skill).toLowerCase() === normalizeSkillName(skillName).toLowerCase()
        );
        if (!hasApprovedSkill) {
            return res.status(400).json({ message: 'This skill is not approved yet, so users cannot book it.' });
        }

        const duplicateSession = await Session.findOne({
            learnerEmail: email,
            mentorEmail,
            skill: skillName,
            status: { $in: ['Pending', 'Scheduled', 'Active'] }
        });
        if (duplicateSession) {
            return res.status(400).json({ message: 'You already have an active request for this skill with this teacher.' });
        }

        if (user.credits < 1) return res.status(400).json({ message: 'Insufficient credits! You need at least 1 credit.' });

        user.credits -= 1;
        await user.save();

        // Create Session in Database
        if (mentorEmail && date && time) {
            await Session.create({
                learnerEmail: email,
                learnerName: user.name,
                mentorEmail: mentorEmail,
                mentorName: mentorName || mentor.name || 'Community Mentor',
                skill: normalizeSkillName(skillName),
                date: date,
                time: time
            });
        }
        res.json({ user, message: 'Swap scheduled successfully' });
    } catch (error) {
        console.error('Swap request error:', error);
        res.status(500).json({ message: 'Server error scheduling swap' });
    }
});

// Approve Session Route
router.put('/approve-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findByIdAndUpdate(sessionId, { status: 'Scheduled' }, { new: true });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Auto-send a message/notification to the learner
        await Message.create({
            senderEmail: session.mentorEmail,
            senderName: session.mentorName,
            receiverEmail: session.learnerEmail,
            message: `✅ Great news! I've approved your request for **${session.skill}**. The class is set for **${session.date} at ${session.time}**. Be ready to join the video from your dashboard! 🚀`
        });

        res.json({ message: 'Session approved successfully' });
    } catch (error) {
        console.error('Approve session error:', error);
        res.status(500).json({ message: 'Server error approving session' });
    }
});

// Learner Joins Session Route
router.put('/join-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const attemptId = createAttemptId();
        const session = await Session.findByIdAndUpdate(
            sessionId,
            {
                status: 'Active',
                'call.attemptId': attemptId,
                'call.offer': null,
                'call.answer': null,
                'call.iceCandidates': [],
                'call.startedAt': new Date(),
                'call.endedAt': null
            },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json({ message: 'Session is now active', session });
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ message: 'Server error joining session' });
    }
});

// End Session (Awards credit to teacher instantly)
router.put('/end-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.status === 'Active') {
            session.status = 'Completed';
            session.call = {
                offer: null,
                answer: null,
                iceCandidates: [],
                startedAt: session.call?.startedAt || new Date(),
                endedAt: new Date()
            };
            await session.save();
            // Award 1 credit to the mentor instantly for normal learning swaps only
            if (session.sessionType !== 'skill-review') {
                const teacher = await User.findOne({ email: session.mentorEmail });
                if (teacher) {
                    teacher.credits = (teacher.credits !== undefined ? teacher.credits : 5) + 1;
                    await teacher.save();
                }
            }
        }
        res.json({ message: 'Session ended successfully' });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ message: 'Server error ending session' });
    }
});

router.get('/session-call/:sessionId', async (req, res) => {
    try {
        const { email } = req.query;
        if (!mongoose.Types.ObjectId.isValid(req.params.sessionId)) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = await Session.findById(req.params.sessionId).lean();
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(getSanitizedCallState(session, email));
    } catch (error) {
        console.error('Session call fetch error:', error);
        res.status(500).json({ message: 'Server error fetching call state' });
    }
});

router.post('/session-call', async (req, res) => {
    try {
        const { sessionId, type, fromEmail, toEmail, payload, attemptId } = req.body;
        const session = await Session.findById(sessionId);

        if (!session) return res.status(404).json({ message: 'Session not found' });
        const learnerEmail = (session.learnerEmail || '').trim().toLowerCase();
        const mentorEmail = (session.mentorEmail || '').trim().toLowerCase();
        const normalizedFromEmail = (fromEmail || '').trim().toLowerCase();
        const normalizedToEmail = (toEmail || '').trim().toLowerCase();
        const allowedParticipants = [learnerEmail, mentorEmail].filter(Boolean);

        if (!allowedParticipants.includes(normalizedFromEmail)) {
            return res.status(400).json({ message: 'Invalid caller for this session' });
        }

        const resolvedToEmail = normalizedToEmail && normalizedToEmail !== normalizedFromEmail
            ? normalizedToEmail
            : (normalizedFromEmail === learnerEmail ? mentorEmail : learnerEmail);

        if (!allowedParticipants.includes(resolvedToEmail) || resolvedToEmail === normalizedFromEmail) {
            return res.status(400).json({ message: 'Invalid target participant for this session' });
        }

        if (!['offer', 'answer', 'ice-candidate', 'reset'].includes(type)) {
            return res.status(400).json({ message: 'Invalid call signal type' });
        }

        const activeAttemptId = session.call?.attemptId || '';

        if (type !== 'reset' && attemptId && activeAttemptId && attemptId !== activeAttemptId) {
            return res.status(409).json({ message: 'Stale call attempt' });
        }

        let updatedSession = null;

        if (type === 'offer') {
            updatedSession = await Session.findByIdAndUpdate(
                sessionId,
                {
                    $set: {
                        'call.attemptId': attemptId || activeAttemptId || createAttemptId(),
                        'call.offer': {
                            fromEmail: normalizedFromEmail,
                            toEmail: resolvedToEmail,
                            attemptId: attemptId || activeAttemptId || '',
                            payload,
                            updatedAt: new Date()
                        },
                        'call.answer': null,
                        'call.iceCandidates': [],
                        'call.startedAt': new Date(),
                        'call.endedAt': null
                    }
                },
                { new: true }
            );
        }

        if (type === 'answer') {
            updatedSession = await Session.findByIdAndUpdate(
                sessionId,
                {
                    $set: {
                        'call.answer': {
                            fromEmail: normalizedFromEmail,
                            toEmail: resolvedToEmail,
                            attemptId: attemptId || activeAttemptId || '',
                            payload,
                            updatedAt: new Date()
                        },
                        'call.endedAt': null
                    }
                },
                { new: true }
            );
        }

        if (type === 'ice-candidate') {
            updatedSession = await Session.findByIdAndUpdate(
                sessionId,
                {
                    $push: {
                        'call.iceCandidates': {
                            fromEmail: normalizedFromEmail,
                            toEmail: resolvedToEmail,
                            attemptId: attemptId || activeAttemptId || '',
                            candidate: payload
                        }
                    },
                    $set: {
                        'call.endedAt': null
                    }
                },
                { new: true }
            );
        }

        if (type === 'reset') {
            const nextAttemptId = createAttemptId();
            updatedSession = await Session.findByIdAndUpdate(
                sessionId,
                {
                    $set: {
                        'call.attemptId': nextAttemptId,
                        'call.offer': null,
                        'call.answer': null,
                        'call.iceCandidates': [],
                        'call.startedAt': new Date(),
                        'call.endedAt': null
                    }
                },
                { new: true }
            );
        }

        res.json({ message: 'Call signal saved', call: getSanitizedCallState(updatedSession, resolvedToEmail || normalizedFromEmail) });
    } catch (error) {
        console.error('Session call signal error:', error);
        res.status(500).json({ message: 'Server error saving call state' });
    }
});

// Fetch Live Session Chat
router.get('/session-chat/:sessionId', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session.chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching chat' });
    }
});

// Send Message to Live Session Chat
router.post('/session-chat', async (req, res) => {
    try {
        const { sessionId, sender, text } = req.body;
        const session = await Session.findByIdAndUpdate(
            sessionId,
            { $push: { chat: { sender, text } } },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session.chat);
    } catch (error) {
        console.error('Session chat error:', error);
        res.status(500).json({ message: 'Server error saving chat' });
    }
});

// Session Feedback & Completion
router.post('/session-feedback', async (req, res) => {
    try {
        const { submittedByEmail, teacherName, teacherEmail, skillTaught, rating, complaint } = req.body;

        // Save the rating to database
        const newRating = new Rating({ submittedByEmail, teacherName, teacherEmail, skillTaught, rating, complaint });
        await newRating.save();

        // Update session status to Completed
        if (teacherEmail) {
            await Session.findOneAndUpdate(
                { learnerEmail: submittedByEmail, mentorEmail: teacherEmail, skill: skillTaught, status: { $in: ['Scheduled', 'Active'] } },
                { status: 'Completed' }
            );
        }

        // Update Teacher's average rating
        const teacher = await User.findOne({ email: teacherEmail });
        if (teacher) {
            teacher.ratingCount = (teacher.ratingCount || 0) + 1;
            teacher.rating = ((teacher.rating || 0) * (teacher.ratingCount - 1) + rating) / teacher.ratingCount;
            await teacher.save();
        }

        res.json({ message: 'Rating submitted successfully', teacher });
    } catch (error) {
        console.error('Session feedback error:', error);
        res.status(500).json({ message: 'Server error saving feedback' });
    }
});

// Add the PUT /profile route to handle frontend profile updates
router.put('/profile', async (req, res) => {
    try {
        const { email, name, bio, skillsWanted, password } = req.body;

        let updateData = { name, bio, skillsWanted };
        // Only update password if provided
        if (password && password.trim() !== '') {
            updateData.password = password;
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            updateData,
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Add avatar upload route
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        const { email } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const avatarUrl = 'uploads/' + req.file.filename;
        const updatedUser = await User.findOneAndUpdate({ email }, { avatar: avatarUrl }, { new: true });

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ user: updatedUser, message: 'Avatar updated successfully' });
    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({ message: 'Server error updating avatar' });
    }
});

// Add Skill Route (Handles File Uploads for Certificates)
router.post('/skills', upload.single('certificateFile'), async (req, res) => {
    try {
        const { email, skill, type } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Finalize skill string format. If file exists, attach its path so admins can view it
        let finalSkillString = skill;
        if (req.file) {
            const certUrl = '/uploads/' + req.file.filename;
            finalSkillString = finalSkillString.replace('Certificate]', `Certificate=${certUrl}]`);
        }

        if (type === 'offered') {
            user.skillsOffered = user.skillsOffered || [];
            user.skillsOffered.push(finalSkillString);

            if (/\[Pending Approval:\s*.*Live Interaction/i.test(finalSkillString)) {
                await Session.create({
                    sessionType: 'skill-review',
                    learnerEmail: user.email,
                    learnerName: user.name,
                    mentorName: 'Skill Review Admin',
                    skill: `Skill Review: ${normalizeSkillName(finalSkillString)}`,
                    date: new Date().toISOString(),
                    time: 'To be scheduled',
                    status: 'Pending',
                    skillRequestProviderId: user._id,
                    skillRequestProviderEmail: user.email,
                    skillRequestRawSkill: finalSkillString
                });
            }
        } else {
            user.skillsWanted = user.skillsWanted || [];
            user.skillsWanted.push(finalSkillString);
        }

        await user.save();
        res.json({ user, message: 'Skill added successfully' });
    } catch (error) {
        console.error('Skill add error:', error);
        res.status(500).json({ message: 'Server error adding skill' });
    }
});

// Dashboard Real-Time Data Aggregation Route
router.get('/dashboard-data', async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });

        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#bc13fe', '#ff6b6b'];
        const getRandColor = () => colors[Math.floor(Math.random() * colors.length)];

        // 1. Top Mentors (Real users from DB with good ratings)
        const topMentorsDocs = await User.find({
            rating: { $gte: 0 },
            email: { $ne: email },
            role: { $nin: ['Teacher Admin', 'Main Admin', 'Super Admin'] },
        })
            .sort({ rating: -1, ratingCount: -1 })
            .limit(10);

        const topMentors = topMentorsDocs
        .filter(m => (m.skillsOffered || []).some(skill => !skill.includes('[Pending Approval')))
        .slice(0, 3)
        .map(m => ({
            name: m.name,
            expertIn: (m.skillsOffered || []).find(skill => !skill.includes('[Pending Approval')) || 'Community Mentor',
            initials: m.name.substring(0, 2).toUpperCase(),
            avatarBg: getRandColor()
        }));

        // 2. Recommended Matches (Real users wanting what you offer)
        let matchQuery = { email: { $ne: email } };
        if (user && user.skillsOffered && user.skillsOffered.length > 0) {
            matchQuery.skillsWanted = {
                $in: user.skillsOffered
                    .filter(skill => !skill.includes('[Pending Approval'))
                    .map(skill => normalizeSkillName(skill))
            };
        }
        matchQuery.role = { $nin: ['Teacher Admin', 'Main Admin', 'Super Admin'] };
        const matchDocs = await User.find(matchQuery).limit(3);
        const recommendedMatches = matchDocs.map(m => ({
            name: m.name,
            wantsToLearn: m.skillsWanted && m.skillsWanted.length > 0 ? m.skillsWanted[0] : 'Anything',
            initials: m.name.substring(0, 2).toUpperCase(),
            avatarBg: getRandColor()
        }));

        // 3. Learning Journey (Mapped dynamically based on user's wanted skills)
        const learningJourney = (user && user.skillsWanted && user.skillsWanted.length > 0) ? user.skillsWanted.map((skill, index) => ({
            skill: skill,
            progress: 25 + ((index + 1) * 15) % 60, // Generating a dynamic mock progress percentage
            color: colors[index % colors.length]
        })) : [];

        // 4. Certificates (Derived from verified skills offered)
        const certificates = (user && user.skillsOffered && user.skillsOffered.length > 0) ? user.skillsOffered
            .filter(skill => !skill.includes('[Pending Approval'))
            .map(skill => ({
                title: skill,
                issuer: 'SkillSwap Verification',
                date: new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
            })) : [];

        // 5. Scheduled Sessions (Learner & Teaching)
        const learnerSessionsDocs = await Session.find({ learnerEmail: email, status: { $in: ['Pending', 'Scheduled', 'Active'] } }).sort({ date: 1 });
        const mentorSessionsDocs = await Session.find({ mentorEmail: email, status: { $in: ['Pending', 'Scheduled', 'Active'] } }).sort({ date: 1 });

        const upcomingSessions = learnerSessionsDocs.map(s => {
            const d = new Date(s.date);
            return {
                id: s._id,
                day: d.getDate().toString(),
                month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                title: s.skill,
                mentorName: s.mentorName || 'Skill Review Admin',
                mentorEmail: s.mentorEmail,
                time: s.time || 'To be scheduled',
                status: s.status,
                sessionType: s.sessionType || 'swap'
            };
        });

        const teachingSchedule = mentorSessionsDocs.map(s => {
            const d = new Date(s.date);
            return {
                id: s._id,
                day: d.getDate().toString(),
                month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                title: s.skill,
                studentName: s.learnerName,
                studentEmail: s.learnerEmail,
                time: s.time || 'To be scheduled',
                status: s.status,
                sessionType: s.sessionType || 'swap'
            };
        });

        const pendingSkillReviews = await Session.find({
            learnerEmail: email,
            sessionType: 'skill-review',
            status: { $in: ['Pending', 'Scheduled', 'Active'] }
        }).sort({ createdAt: -1 });

        const reviewActivities = pendingSkillReviews.map((review) => ({
            icon: review.status === 'Active' ? '🎥' : '🛡️',
            title: `Skill review ${review.status.toLowerCase()}`,
            desc: `${review.skill} • ${review.time || 'Awaiting admin schedule'}`
        }));

        res.json({
            upcomingSessions,
            topMentors,
            learningJourney,
            certificates,
            dailyChallenges: [
                { title: 'Update your profile bio', difficulty: 'Easy', colorClass: '#10b981', bgClass: 'rgba(16, 185, 129, 0.2)' },
                { title: 'Request a Skill Swap', difficulty: 'Medium', colorClass: '#f59e0b', bgClass: 'rgba(245, 158, 11, 0.2)' },
                { title: 'Earn a 5-star rating', difficulty: 'Hard', colorClass: '#ef4444', bgClass: 'rgba(239, 68, 68, 0.2)' }
            ],
            recentActivities: [
                { icon: '✅', title: 'System Active', desc: 'Real-time dashboard connected successfully.' },
                ...reviewActivities
            ],
            recommendedMatches,
            studentReviews: [],
            teachingSchedule
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

// Real-Time Notifications Route
router.get('/notifications', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.json([]);

        const user = await User.findOne({ email });
        if (!user) return res.json([]);

        const unreadMsgs = await Message.countDocuments({ receiverEmail: email, isRead: false });
        const notifications = [];

        if (unreadMsgs > 0) {
            notifications.push({ title: 'New Messages 💬', desc: `You have ${unreadMsgs} unread message(s) waiting.` });
        }

        if (!user.avatar) {
            notifications.push({ title: 'Profile Tip 📸', desc: 'Upload an avatar picture to stand out!' });
        }

        if (!user.skillsWanted || user.skillsWanted.length === 0) {
            notifications.push({ title: 'Action Needed 🎯', desc: 'Add skills you want to learn to get matches.' });
        }

        if (!user.skillsOffered || user.skillsOffered.length === 0) {
            notifications.push({ title: 'Become a Mentor 👨‍🏫', desc: 'Add a skill you can teach others.' });
        }

        // Agar sab kuch badhiya hai
        if (notifications.length === 0) {
            notifications.push({ title: 'All caught up! ✨', desc: 'No new alerts at the moment.' });
        }

        res.json(notifications);
    } catch (error) {
        console.error('Notifications fetch error:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

module.exports = router;
