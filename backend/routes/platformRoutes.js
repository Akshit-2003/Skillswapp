const express = require('express');
const User = require('../models/User');
const { normalizeSkillName } = require('../utils/skillHelpers');

const router = express.Router();

router.get('/skills', async (_req, res) => {
  try {
    const usersWithSkills = await User.find({
      'skillsOffered.0': { $exists: true },
      role: { $nin: ['Teacher Admin', 'Main Admin', 'Super Admin'] },
    });
    const allSkills = usersWithSkills.flatMap((user) =>
      user.skillsOffered
      .filter((skill) => !skill.includes('[Pending Approval'))
      .map((skill) => ({
        skillId: `${user._id}-${skill.replace(/\s+/g, '-')}`,
        skillName: normalizeSkillName(skill),
        skill,
        providerName: user.name,
        name: user.name,
        providerEmail: user.email,
        email: user.email,
        providerId: user._id,
        role: user.role,
        status: 'Verified',
      })),
    );

    return res.json(allSkills);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
