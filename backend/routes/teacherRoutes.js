const express = require('express');
const AdminReport = require('../models/AdminReport');
const Rating = require('../models/Rating');
const Swap = require('../models/Swap');
const User = require('../models/User');
const Session = require('../models/Session');
const Message = require('../models/Message');
const { normalizeSkillName, pendingSkillPattern } = require('../utils/skillHelpers');

const router = express.Router();

const createAttemptId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getReviewSkillLabel = (skillName = '') => `Skill Review: ${normalizeSkillName(skillName)}`;

const buildReviewSessionPayload = (session) => session ? {
  id: session._id,
  status: session.status,
  date: session.date,
  time: session.time,
  mentorEmail: session.mentorEmail,
  mentorName: session.mentorName,
  sessionType: session.sessionType,
} : null;

const findReviewSession = async (providerId, skillName) => Session.findOne({
  sessionType: 'skill-review',
  skillRequestProviderId: providerId,
  skill: getReviewSkillLabel(skillName),
}).sort({ createdAt: -1 });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      role: 'Teacher Admin',
      credits: 100,
    });

    await newAdmin.save();
    return res.status(201).json({ message: 'Teacher Admin registered successfully!', user: newAdmin });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/skill-requests', async (_req, res) => {
  try {
    const usersWithPendingSkills = await User.find({
      skillsOffered: { $elemMatch: { $regex: /\[Pending Approval/i } },
    });

    const baseRequests = usersWithPendingSkills.flatMap((user) =>
      user.skillsOffered
        .filter((skill) => pendingSkillPattern.test(skill))
        .map((skill, index) => ({
          requestId: `${user._id}-${index}-${normalizeSkillName(skill).replace(/\s+/g, '-')}`,
          providerId: user._id,
          providerName: user.name,
          providerEmail: user.email,
          rawSkill: skill,
          skillName: normalizeSkillName(skill),
        })),
    );

    const pendingRequests = await Promise.all(
      baseRequests.map(async (request) => {
        const reviewSession = await findReviewSession(request.providerId, request.skillName);
        return {
          ...request,
          reviewSession: buildReviewSessionPayload(reviewSession),
        };
      }),
    );

    return res.json(pendingRequests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/schedule-review-session', async (req, res) => {
  try {
    const { providerId, skillName, date, time, adminEmail, adminName } = req.body;

    if (!providerId || !skillName || !adminEmail || !adminName || !date || !time) {
      return res.status(400).json({ message: 'providerId, skillName, date, time, adminEmail, and adminName are required' });
    }

    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const reviewSkill = getReviewSkillLabel(skillName);
    let reviewSession = await findReviewSession(providerId, skillName);

    if (!reviewSession) {
      reviewSession = await Session.create({
        sessionType: 'skill-review',
        learnerEmail: provider.email,
        learnerName: provider.name,
        mentorEmail: adminEmail,
        mentorName: adminName,
        skill: reviewSkill,
        date,
        time,
        status: 'Scheduled',
        skillRequestProviderId: provider._id,
        skillRequestProviderEmail: provider.email,
        skillRequestRawSkill: provider.skillsOffered.find((skill) => normalizeSkillName(skill) === normalizeSkillName(skillName)) || '',
        scheduledByEmail: adminEmail,
        scheduledByName: adminName,
      });
    } else {
      reviewSession.mentorEmail = adminEmail;
      reviewSession.mentorName = adminName;
      reviewSession.date = date;
      reviewSession.time = time;
      reviewSession.status = 'Scheduled';
      reviewSession.scheduledByEmail = adminEmail;
      reviewSession.scheduledByName = adminName;
      await reviewSession.save();
    }

    await Message.create({
      senderEmail: adminEmail,
      senderName: adminName,
      receiverEmail: provider.email,
      message: `Your live skill review for **${normalizeSkillName(skillName)}** is scheduled on **${date}** at **${time}**. Join from your dashboard when the admin starts the review.`,
    });

    return res.json({ message: 'Review session scheduled successfully', reviewSession: buildReviewSessionPayload(reviewSession) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/start-review-session', async (req, res) => {
  try {
    const { providerId, skillName, adminEmail, adminName } = req.body;

    if (!providerId || !skillName || !adminEmail || !adminName) {
      return res.status(400).json({ message: 'providerId, skillName, adminEmail, and adminName are required' });
    }

    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    let reviewSession = await findReviewSession(providerId, skillName);
    const now = new Date();

    if (!reviewSession) {
      reviewSession = await Session.create({
        sessionType: 'skill-review',
        learnerEmail: provider.email,
        learnerName: provider.name,
        mentorEmail: adminEmail,
        mentorName: adminName,
        skill: getReviewSkillLabel(skillName),
        date: now.toISOString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Active',
        skillRequestProviderId: provider._id,
        skillRequestProviderEmail: provider.email,
        skillRequestRawSkill: provider.skillsOffered.find((skill) => normalizeSkillName(skill) === normalizeSkillName(skillName)) || '',
        scheduledByEmail: adminEmail,
        scheduledByName: adminName,
        call: {
          attemptId: createAttemptId(),
          offer: null,
          answer: null,
          iceCandidates: [],
          startedAt: now,
          endedAt: null,
        },
      });
    } else {
      reviewSession.mentorEmail = adminEmail;
      reviewSession.mentorName = adminName;
      reviewSession.status = 'Active';
      reviewSession.scheduledByEmail = adminEmail;
      reviewSession.scheduledByName = adminName;
      reviewSession.date = reviewSession.date || now.toISOString();
      reviewSession.time = reviewSession.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      reviewSession.call = {
        attemptId: createAttemptId(),
        offer: null,
        answer: null,
        iceCandidates: [],
        startedAt: now,
        endedAt: null,
      };
      await reviewSession.save();
    }

    await Message.create({
      senderEmail: adminEmail,
      senderName: adminName,
      receiverEmail: provider.email,
      message: `Your live skill review for **${normalizeSkillName(skillName)}** has started. Open your dashboard and click Join Video now.`,
    });

    return res.json({ message: 'Review session started successfully', reviewSession: buildReviewSessionPayload(reviewSession) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/approve-skill', async (req, res) => {
  try {
    const { providerId, skillName, adminEmail, adminName } = req.body;

    if (!providerId || !skillName) {
      return res.status(400).json({ message: 'providerId and skillName are required' });
    }

    const user = await User.findById(providerId);
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const skillIndex = user.skillsOffered.findIndex(
      (skill) => normalizeSkillName(skill) === normalizeSkillName(skillName),
    );

    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Pending skill request not found' });
    }

    const rawSkill = user.skillsOffered[skillIndex] || '';
    const requiresLiveReview = /\[Pending Approval:\s*.*Live Interaction/i.test(rawSkill);
    const reviewSession = await findReviewSession(providerId, skillName);

    const reviewWasConducted = !!reviewSession?.call?.startedAt;
    if (requiresLiveReview && (!reviewSession || !reviewWasConducted || !['Active', 'Completed'].includes(reviewSession.status))) {
      return res.status(400).json({ message: 'Live interaction review must be started before this skill can be approved.' });
    }

    user.skillsOffered[skillIndex] = normalizeSkillName(user.skillsOffered[skillIndex]);
    user.markModified('skillsOffered');
    await user.save();

    if (reviewSession) {
      reviewSession.status = 'Completed';
      reviewSession.reviewCompletedAt = new Date();
      reviewSession.call = {
        attemptId: reviewSession.call?.attemptId || '',
        offer: null,
        answer: null,
        iceCandidates: [],
        startedAt: reviewSession.call?.startedAt || new Date(),
        endedAt: new Date(),
      };
      if (adminEmail) reviewSession.mentorEmail = adminEmail;
      if (adminName) reviewSession.mentorName = adminName;
      await reviewSession.save();
    }

    if (adminEmail && adminName) {
      await Message.create({
        senderEmail: adminEmail,
        senderName: adminName,
        receiverEmail: user.email,
        message: `Your skill **${normalizeSkillName(skillName)}** has been approved after admin review. It is now live on your profile.`,
      });
    }

    return res.json({ message: 'Skill approved successfully' });
  } catch (error) {
    console.error('Backend approve error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/reject-skill', async (req, res) => {
  try {
    const { providerId, skillName, adminEmail, adminName } = req.body;

    if (!providerId || !skillName) {
      return res.status(400).json({ message: 'providerId and skillName are required' });
    }

    const user = await User.findById(providerId);
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const originalLength = user.skillsOffered.length;
    user.skillsOffered = user.skillsOffered.filter(
      (skill) => normalizeSkillName(skill) !== normalizeSkillName(skillName),
    );

    if (user.skillsOffered.length === originalLength) {
      return res.status(404).json({ message: 'Pending skill request not found' });
    }

    await user.save();

    const reviewSession = await findReviewSession(providerId, skillName);
    if (reviewSession) {
      reviewSession.status = 'Rejected';
      reviewSession.reviewCompletedAt = new Date();
      reviewSession.call = {
        attemptId: reviewSession.call?.attemptId || '',
        offer: null,
        answer: null,
        iceCandidates: [],
        startedAt: reviewSession.call?.startedAt || null,
        endedAt: new Date(),
      };
      if (adminEmail) reviewSession.mentorEmail = adminEmail;
      if (adminName) reviewSession.mentorName = adminName;
      await reviewSession.save();
    }

    if (adminEmail && adminName) {
      await Message.create({
        senderEmail: adminEmail,
        senderName: adminName,
        receiverEmail: user.email,
        message: `Your skill **${normalizeSkillName(skillName)}** was rejected after admin review. Please update your proof and submit again.`,
      });
    }

    return res.json({ message: 'Skill request rejected successfully' });
  } catch (error) {
    console.error('Backend reject error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/swaps', async (_req, res) => {
  try {
    const swaps = await Swap.find().sort({ createdAt: -1 }).limit(100);
    return res.json(swaps);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/ratings', async (_req, res) => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 }).limit(100);
    return res.json(ratings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/report-rating', async (req, res) => {
  try {
    const { ratingId } = req.body;

    if (!ratingId) {
      return res.status(400).json({ message: 'ratingId is required' });
    }

    const ratingEntry = await Rating.findById(ratingId);
    if (!ratingEntry) {
      return res.status(404).json({ message: 'Rating entry not found' });
    }

    const existingReport = await AdminReport.findOne({ sourceRatingId: ratingEntry._id });
    if (existingReport) {
      return res.json({ message: 'Report already exists', report: existingReport });
    }

    const report = await AdminReport.create({
      targetUserId: ratingEntry.teacherId || null,
      targetUserName: ratingEntry.teacherName,
      targetUserEmail: ratingEntry.teacherEmail,
      reason: ratingEntry.rating < 3 ? 'Low rating escalation' : 'Moderation review requested',
      complaint: ratingEntry.complaint || '',
      sourceRatingId: ratingEntry._id,
    });

    return res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/reports', async (_req, res) => {
  try {
    const reports = await AdminReport.find().sort({ createdAt: -1 }).limit(100);
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
