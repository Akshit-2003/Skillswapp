export const apiRoutes = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    socialLogin: '/api/auth/social-login',
    registerSuperAdmin: '/api/auth/register-super-admin',
  },
  user: {
    profile: '/api/user/profile',
    skills: '/api/user/skills',
    swapRequests: '/api/user/swap-requests',
    messages: '/api/user/messages',
    updateProfile: '/api/user/profile',
    sessionFeedback: '/api/user/session-feedback',
  },
  teacher: {
    register: '/api/teacher/register',
    skillRequests: '/api/teacher/skill-requests',
    scheduleReviewSession: '/api/teacher/schedule-review-session',
    startReviewSession: '/api/teacher/start-review-session',
    approveSkill: '/api/teacher/approve-skill',
    rejectSkill: '/api/teacher/reject-skill',
    swaps: '/api/teacher/swaps',
    ratings: '/api/teacher/ratings',
    reportRating: '/api/teacher/report-rating',
    reports: '/api/teacher/reports',
  },
  admin: {
    teachers: '/api/admin/teachers',
    users: '/api/admin/users',
    stats: '/api/admin/stats',
    skills: '/api/admin/skills',
    removeTeacher: (id) => `/api/admin/teachers/${id}`,
    removeUser: (id) => `/api/admin/users/${id}`,
  },
  platform: {
    skills: '/api/platform/skills',
  },
};
