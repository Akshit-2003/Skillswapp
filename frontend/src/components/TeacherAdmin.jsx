import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { clearStoredUser, getStoredUser } from '../utils/auth';

const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const PageContainer = ({ title, subtitle, children }) => (
  <div style={{ textAlign: 'left', animation: 'fadeInUp 0.5s ease-out', maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
    <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
      {title}
    </h1>
    {subtitle && <p style={{ color: '#9ca3af', marginTop: 0, marginBottom: '2rem', fontSize: '0.95rem' }}>{subtitle}</p>}
    {children}
  </div>
);

const StatCard = ({ title, value, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#1f2937',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 6px 0', fontWeight: '500' }}>{title}</p>
      <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color, margin: 0 }}>{value}</h3>
    </div>
  );
};

const TableCell = ({ children, align = 'left' }) => (
  <td style={{ padding: '16px', borderBottom: '1px solid #374151', textAlign: align, color: '#d1d5db', fontSize: '0.95rem' }}>
    {children}
  </td>
);

const SidebarItem = ({ to, label, icon, active, badgeCount }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', margin: '4px 12px',
        textDecoration: 'none', color: active ? '#fff' : (isHovered ? '#e5e7eb' : '#9ca3af'),
        background: active ? 'rgba(100,108,255,0.15)' : (isHovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
        borderRadius: '8px', borderLeft: active ? '4px solid #646cff' : '4px solid transparent',
        transition: 'all 0.2s ease', fontWeight: active ? '600' : '500',
      }}
    >
      <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
      {badgeCount > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: '12px', fontSize: '0.75rem', padding: '2px 8px', fontWeight: 'bold' }}>{badgeCount}</span>}
    </Link>
  );
};

const TeacherAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [swapRecords, setSwapRecords] = useState([]);
  const [ratingRecords, setRatingRecords] = useState([]);
  const [reportRecords, setReportRecords] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [reviewSchedule, setReviewSchedule] = useState({ date: '', time: '10:00 AM' });
  const [callStatus, setCallStatus] = useState('Ready to connect');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [hasRemoteMedia, setHasRemoteMedia] = useState(false);
  const [isPreparingCall, setIsPreparingCall] = useState(false);
  const [localMediaError, setLocalMediaError] = useState('');
  const [sessionChat, setSessionChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const processedSignalsRef = useRef({ offer: null, answer: null, candidates: new Set() });
  const pendingIceCandidatesRef = useRef([]);
  const callAttemptIdRef = useRef('');

  useEffect(() => {
    const parsedUser = getStoredUser();
    if (!parsedUser) {
      navigate('/admin/login');
      return;
    }

    if (parsedUser.role !== 'Teacher Admin' && parsedUser.role !== 'Main Admin' && parsedUser.role !== 'Super Admin') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const getAdminUser = () => getStoredUser() || {};

  const getReviewSession = () => selectedRequest?.reviewSession || null;

  const attachVideoStreams = () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play?.().catch(() => {});
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play?.().catch(() => {});
    }
  };

  const cleanupCallResources = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    remoteStreamRef.current = null;
    processedSignalsRef.current = { offer: null, answer: null, candidates: new Set() };
    pendingIceCandidatesRef.current = [];
    callAttemptIdRef.current = '';

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setHasRemoteMedia(false);
    setIsPreparingCall(false);
    setCallStatus('Ready to connect');
    setIsMicEnabled(true);
    setIsCameraEnabled(true);
    setLocalMediaError('');
    setSessionChat([]);
    setChatInput('');
  };

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const user = getStoredUser();
      const isSuper = user?.role === 'Main Admin' || user?.role === 'Super Admin';
      const teacherSkills = user?.skillsOffered || [];

      // Helper logic to filter specific skills for Teacher Admins
      const isRelevant = (skillString) => {
        if (isSuper || teacherSkills.length === 0) return true; // Super admins see everything
        if (!skillString) return false;
        const target = skillString.toLowerCase();
        return teacherSkills.some(ts => target.includes(ts.toLowerCase()) || ts.toLowerCase().includes(target));
      };

      const [pendingRes, skillsRes, usersRes, swapsRes, ratingsRes, reportsRes] = await Promise.all([
        fetch(buildApiUrl(apiRoutes.teacher.skillRequests)),
        fetch(buildApiUrl(apiRoutes.platform.skills)),
        fetch(buildApiUrl(apiRoutes.admin.users)),
        fetch(buildApiUrl(apiRoutes.teacher.swaps)),
        fetch(buildApiUrl(apiRoutes.teacher.ratings)),
        fetch(buildApiUrl(apiRoutes.teacher.reports))
      ]);

      const [pendingData, skillsData, usersData, swapsData, ratingsData, reportsData] = await Promise.all([
        pendingRes.json(),
        skillsRes.json(),
        usersRes.json(),
        swapsRes.json(),
        ratingsRes.json(),
        reportsRes.json()
      ]);

      if (pendingRes.ok) {
        const data = Array.isArray(pendingData) ? pendingData : [];
        setPendingRequests(data.filter(req => isRelevant(req.skillName)));
      }
      if (skillsRes.ok) {
        const data = Array.isArray(skillsData) ? skillsData : [];
        setAllSkills(data.filter(s => isRelevant(s.skillName || s.skill)));
      }
      if (usersRes.ok) setAllUsers(Array.isArray(usersData) ? usersData : []);
      if (swapsRes.ok) {
        const data = Array.isArray(swapsData) ? swapsData : [];
        setSwapRecords(data.filter(swap => isRelevant(swap.requestedSkill)));
      }
      if (ratingsRes.ok) {
        const data = Array.isArray(ratingsData) ? ratingsData : [];
        setRatingRecords(data.filter(rating => isRelevant(rating.skillTaught)));
      }
      if (reportsRes.ok) setReportRecords(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error('Teacher admin fetch error:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time Database Sync for User Lookup and other records (Updates every 5 seconds)
    const intervalId = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const openReviewRequestId = location.state?.openReviewRequestId;
    if (!openReviewRequestId || pendingRequests.length === 0) return;

    const matchedRequest = pendingRequests.find((request) => request.requestId === openReviewRequestId);
    if (matchedRequest) {
      setSelectedRequest(matchedRequest);
      setShowVideoModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, pendingRequests, navigate]);

  const updateSelectedRequestSession = (reviewSession) => {
    if (!selectedRequest) return;
    setSelectedRequest((prev) => prev ? ({ ...prev, reviewSession }) : prev);
  };

  const closeVideoModal = () => {
    cleanupCallResources();
    setShowVideoModal(false);
  };

  const sendCallSignal = async (sessionId, type, fromEmail, toEmail, payload = null) => {
    const response = await fetch(buildApiUrl('/api/user/session-call'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, type, fromEmail, toEmail, payload, attemptId: callAttemptIdRef.current })
    });

    if (!response.ok) {
      throw new Error(`Failed to sync ${type} signal`);
    }

    const data = await response.json();
    if (data?.call?.attemptId) {
      callAttemptIdRef.current = data.call.attemptId;
    }
    return data;
  };

  const ensureLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalMediaError('');
      attachVideoStreams();
      return stream;
    } catch (error) {
      console.error('Admin local media error:', error);
      setLocalMediaError('Camera/microphone blocked. You can still receive the teacher stream.');
      return null;
    }
  };

  const createPeerConnection = async () => {
    const reviewSession = getReviewSession();
    if (!reviewSession || !selectedRequest) return null;

    if (
      peerConnectionRef.current &&
      !['failed', 'closed', 'disconnected'].includes(peerConnectionRef.current.connectionState)
    ) {
      return peerConnectionRef.current;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const stream = await ensureLocalStream();
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;

    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

    if (stream) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
    } else {
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });
    }

    peerConnection.ontrack = (event) => {
      const incomingTracks = event.streams?.[0]?.getTracks?.().length
        ? event.streams[0].getTracks()
        : [event.track];

      incomingTracks.forEach(track => {
        const alreadyAdded = remoteStream.getTracks().some(existingTrack => existingTrack.id === track.id);
        if (!alreadyAdded) {
          remoteStream.addTrack(track);
        }
      });
      setHasRemoteMedia(true);
      setCallStatus('Teacher connected');
      attachVideoStreams();
    };

    peerConnection.onicecandidate = async (event) => {
      if (!event.candidate) return;
      try {
        await sendCallSignal(reviewSession.id, 'ice-candidate', reviewSession.mentorEmail, selectedRequest.providerEmail, event.candidate.toJSON());
      } catch (error) {
        console.error('Admin ICE send error:', error);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      if (state === 'connected' || state === 'completed') setCallStatus('Connected & live');
      if (state === 'connecting') setCallStatus('Connecting...');
      if (state === 'failed' || state === 'disconnected') setCallStatus('Reconnecting...');
      if (state === 'closed') setCallStatus('Review ended');
    };

    peerConnectionRef.current = peerConnection;
    attachVideoStreams();
    return peerConnection;
  };

  const flushPendingIceCandidates = async (peerConnection) => {
    if (!peerConnection?.remoteDescription || pendingIceCandidatesRef.current.length === 0) return;

    const queuedCandidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of queuedCandidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Admin queued ICE error:', error);
      }
    }
  };

  const handleApprove = async (request) => {
    const admin = getAdminUser();
    const url = buildApiUrl(apiRoutes.teacher.approveSkill);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: request.providerId,
          skillName: request.skillName,
          adminEmail: admin.email,
          adminName: admin.name
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Server returned an invalid response. Check backend terminal for crashes.");
      }

      if (!response.ok) {
        alert(data.message || data.error || 'Failed to approve skill');
        return;
      }

      alert('Skill approved successfully');
      setShowVideoModal(false);
      setShowQuizModal(false);
      setShowCertificateModal(false);
      fetchData();
    } catch (error) {
      console.error("Approve Error:", error);
      alert(`Network Error: Could not connect to backend at ${url}. Check console or backend terminal.`);
    }
  };

  const handleReject = async (request) => {
    const admin = getAdminUser();
    const url = buildApiUrl(apiRoutes.teacher.rejectSkill);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: request.providerId,
          skillName: request.skillName,
          adminEmail: admin.email,
          adminName: admin.name
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Server returned an invalid response. Check backend terminal for crashes.");
      }

      if (!response.ok) {
        alert(data.message || data.error || 'Failed to reject skill');
        return;
      }

      alert('Skill rejected');
      setShowVideoModal(false);
      setShowQuizModal(false);
      setShowCertificateModal(false);
      fetchData();
    } catch (error) {
      console.error("Reject Error:", error);
      alert(`Network Error: Could not connect to backend at ${url}. Check console or backend terminal.`);
    }
  };

  const handleScheduleReview = async (request) => {
    if (!reviewSchedule.date || !reviewSchedule.time) {
      alert('Please select review date and time first.');
      return;
    }

    const admin = getAdminUser();

    try {
      const response = await fetch(buildApiUrl(apiRoutes.teacher.scheduleReviewSession), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: request.providerId,
          skillName: request.skillName,
          date: reviewSchedule.date,
          time: reviewSchedule.time,
          adminEmail: admin.email,
          adminName: admin.name
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || 'Failed to schedule review');
        return;
      }

      updateSelectedRequestSession(data.reviewSession);
      alert('Review session scheduled. Teacher can now see it on their dashboard.');
      fetchData(true);
    } catch (error) {
      console.error('Schedule review error:', error);
      alert('Could not connect to backend while scheduling the review.');
    }
  };

  const handleStartReview = async (request, openModal = false) => {
    const admin = getAdminUser();

    try {
      const response = await fetch(buildApiUrl(apiRoutes.teacher.startReviewSession), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: request.providerId,
          skillName: request.skillName,
          adminEmail: admin.email,
          adminName: admin.name
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || 'Failed to start review session');
        return null;
      }

      const nextRequest = { ...request, reviewSession: data.reviewSession };
      setSelectedRequest(nextRequest);
      if (openModal) setShowVideoModal(true);
      fetchData(true);
      return nextRequest;
    } catch (error) {
      console.error('Start review error:', error);
      alert('Could not connect to backend while starting the review.');
      return null;
    }
  };

  const toggleMicrophone = () => {
    if (!localStreamRef.current) return;
    const nextValue = !isMicEnabled;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = nextValue;
    });
    setIsMicEnabled(nextValue);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const nextValue = !isCameraEnabled;
    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = nextValue;
    });
    setIsCameraEnabled(nextValue);
  };

  const handleEndReview = async () => {
    const reviewSession = getReviewSession();
    if (!reviewSession) return;

    try {
      await fetch(buildApiUrl('/api/user/end-session'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: reviewSession.id })
      });
      closeVideoModal();
      fetchData(true);
    } catch (error) {
      console.error('End review error:', error);
    }
  };

  const handleSendChat = async (event) => {
    if (event.key !== 'Enter' || !chatInput.trim()) return;
    const reviewSession = getReviewSession();
    if (!reviewSession) return;

    try {
      await fetch(buildApiUrl('/api/user/session-chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: reviewSession.id,
          sender: getAdminUser().name || 'Admin',
          text: chatInput.trim()
        })
      });
      setChatInput('');
      const res = await fetch(buildApiUrl(`/api/user/session-chat/${reviewSession.id}`));
      if (res.ok) {
        setSessionChat(await res.json());
      }
    } catch (error) {
      console.error('Admin chat error:', error);
    }
  };

  const handleLogout = () => {
    clearStoredUser();
    navigate('/admin/login');
  };

  useEffect(() => {
    if (!showVideoModal || !selectedRequest?.reviewSession?.id) return undefined;

    let cancelled = false;

    const initializeCall = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
        setCallStatus('Browser not supported');
        return;
      }

      setIsPreparingCall(true);
      setCallStatus('Starting review room...');

      try {
        await createPeerConnection();
        if (!cancelled) {
          setCallStatus('Waiting for teacher to join...');
        }
      } catch (error) {
        console.error('Teacher admin video init error:', error);
        setCallStatus('Unable to start review');
      } finally {
        if (!cancelled) setIsPreparingCall(false);
      }
    };

    initializeCall();

    return () => {
      cancelled = true;
    };
  }, [showVideoModal, selectedRequest?.reviewSession?.id]);

  useEffect(() => {
    if (!showVideoModal || !selectedRequest?.reviewSession?.id || isPreparingCall) return undefined;

    let disposed = false;

    const pollSignals = async () => {
      try {
        const reviewSession = getReviewSession();
        if (!reviewSession) return;

        const res = await fetch(buildApiUrl(`/api/user/session-call/${reviewSession.id}?email=${encodeURIComponent(reviewSession.mentorEmail)}&t=${Date.now()}`), {
          cache: 'no-store'
        });
        if (!res.ok || disposed) return;

        const callState = await res.json();
        if (callState.attemptId) callAttemptIdRef.current = callState.attemptId;

        const peerConnection = await createPeerConnection();
        if (!peerConnection || disposed) return;

        if (
          callState.offer &&
          callState.offer.fromEmail === selectedRequest.providerEmail &&
          processedSignalsRef.current.offer !== callState.offer.updatedAt
        ) {
          if (!peerConnection.remoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(callState.offer.payload));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await sendCallSignal(reviewSession.id, 'answer', reviewSession.mentorEmail, selectedRequest.providerEmail, answer);
            await flushPendingIceCandidates(peerConnection);
          }
          processedSignalsRef.current.offer = callState.offer.updatedAt;
        }

        if (callState.answer && processedSignalsRef.current.answer !== callState.answer.updatedAt) {
          processedSignalsRef.current.answer = callState.answer.updatedAt;
        }

        if (Array.isArray(callState.iceCandidates)) {
          for (const candidateEntry of callState.iceCandidates) {
            const candidateKey = JSON.stringify(candidateEntry.candidate);
            if (processedSignalsRef.current.candidates.has(candidateKey)) continue;

            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidateEntry.candidate));
            } else {
              pendingIceCandidatesRef.current.push(candidateEntry.candidate);
            }
            processedSignalsRef.current.candidates.add(candidateKey);
          }
        }
      } catch (error) {
        console.error('Teacher admin signal polling error:', error);
      }
    };

    pollSignals();
    const intervalId = setInterval(pollSignals, 2000);
    return () => {
      disposed = true;
      clearInterval(intervalId);
    };
  }, [showVideoModal, selectedRequest?.reviewSession?.id, isPreparingCall]);

  useEffect(() => {
    if (!showVideoModal || !selectedRequest?.reviewSession?.id) return undefined;

    const pollChat = async () => {
      try {
        const reviewSession = getReviewSession();
        if (!reviewSession) return;
        const res = await fetch(buildApiUrl(`/api/user/session-chat/${reviewSession.id}`));
        if (res.ok) {
          setSessionChat(await res.json());
        }
      } catch (error) {
        console.error('Teacher admin chat polling error:', error);
      }
    };

    pollChat();
    const intervalId = setInterval(pollChat, 2000);
    return () => clearInterval(intervalId);
  }, [showVideoModal, selectedRequest?.reviewSession?.id]);

  useEffect(() => () => {
    cleanupCallResources();
  }, []);

  useEffect(() => {
    if (!showVideoModal) {
      cleanupCallResources();
    }
  }, [showVideoModal]);

  const handleReportRating = async (ratingId) => {
    try {
      const response = await fetch(buildApiUrl(apiRoutes.teacher.reportRating), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratingId })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || 'Failed to create report');
        return;
      }
      alert(data.message || 'Reported to Main Admin successfully');
      fetchData();
    } catch (error) {
      console.error('Report Error:', error);
      alert('Could not connect to backend while creating report.');
    }
  };

  const verifiedSkills = allSkills.filter((skill) => skill.status === 'Verified');

  const renderOverviewPage = () => {
    const user = getStoredUser();
    const isSuper = user?.role === 'Main Admin' || user?.role === 'Super Admin';

    return (
      <PageContainer title="Moderator and Verification Portal" subtitle="Verify user skills, monitor active swaps, and track post-session ratings.">
        {!isSuper && (
          <div style={{ marginBottom: '1.5rem', padding: '12px 16px', background: 'rgba(100,108,255,0.1)', borderLeft: '4px solid #646cff', borderRadius: '8px', color: '#93c5fd', fontSize: '0.95rem' }}>
            <strong>🎯 Your Moderated Categories:</strong> {user?.skillsOffered?.join(', ') || 'All Data'} (Filtering records based on your expertise)
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard title="Active Swaps" value={swapRecords.length} color="#10b981" />
          <StatCard title="Flagged Users" value={ratingRecords.filter((item) => item.status === 'Flagged').length} color="#ef4444" />
          <StatCard title="Pending Approvals" value={pendingRequests.length} color="#f59e0b" />
          <StatCard title="Verified Skills" value={verifiedSkills.length} color="#646cff" />
        </div>

        <div style={{ background: '#1f2937', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Swaps Monitored</h3>
            <Link to="/admin/swaps" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>View All</Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#9ca3af', background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '16px' }}>User A</th>
                  <th style={{ padding: '16px' }}>User B</th>
                  <th style={{ padding: '16px' }}>Swapping</th>
                </tr>
              </thead>
              <tbody>
                {swapRecords.slice(0, 3).map((swap) => (
                  <tr key={swap._id}>
                    <TableCell><span style={{ fontWeight: '500', color: '#fff' }}>{swap.requesterName}</span></TableCell>
                    <TableCell>{swap.matchedProviderName || 'Pending Match'}</TableCell>
                    <TableCell>{swap.requestedSkill}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    );
  };

  const renderVerificationPage = () => (
    <PageContainer title="Skill Approvals and Proofs" subtitle="Conduct video checks, send quizzes, or review certificates to verify users.">
      {pendingRequests.length === 0 ? (
        <div style={{ background: '#1f2937', padding: '4rem', textAlign: 'center', borderRadius: '12px', color: '#9ca3af' }}>
          <h3>All caught up</h3>
          <p>No pending verification requests right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {pendingRequests.map((request) => {
            const proofsMatch = request.rawSkill?.match(/\[Pending Approval:\s*(.*?)\]/i);
            const proofs = proofsMatch ? proofsMatch[1].split(',').map((item) => item.trim()) : [];
            const requiresLiveReview = proofs.includes('Live Interaction');

            const certProof = proofs.find(p => p.startsWith('Certificate'));
            const hasCertificate = !!certProof;
            let certUrl = '';
            if (certProof && certProof.includes('=')) {
              const filePath = certProof.split('=')[1].replace(/^\//, '');
              certUrl = buildApiUrl(filePath);
            }

            return (
              <div key={request.requestId} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(100,108,255,0.15)', color: '#646cff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {request.providerName.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>User: {request.providerName}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>{request.providerEmail}</div>
                      <div style={{ color: '#d1d5db', fontSize: '0.95rem' }}>
                        Requested Skill:
                        <span style={{ color: '#10b981', fontWeight: '600', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', marginLeft: '6px' }}>
                          {request.skillName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '260px' }}>
                    {request.reviewSession && (
                      <div style={{ fontSize: '0.82rem', color: '#93c5fd', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', padding: '8px 10px', borderRadius: '8px', textAlign: 'right' }}>
                        Review: <strong>{request.reviewSession.status}</strong>
                        <div>{request.reviewSession.date || 'TBD'} • {request.reviewSession.time || 'TBD'}</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleApprove(request)} disabled={requiresLiveReview && request.reviewSession?.status !== 'Active'} title={requiresLiveReview && request.reviewSession?.status !== 'Active' ? 'Start live review first' : ''} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '8px', cursor: requiresLiveReview && request.reviewSession?.status !== 'Active' ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: requiresLiveReview && request.reviewSession?.status !== 'Active' ? 0.55 : 1 }}>
                        Approve
                      </button>
                      <button onClick={() => handleReject(request)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {proofs.length > 0 && (
                  <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>User provided proofs:</span>
                    {hasCertificate && (
                      <button onClick={() => { setSelectedRequest({ ...request, certUrl }); setShowCertificateModal(true); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        View Certificate
                      </button>
                    )}
                    {proofs.includes('Live Interaction') && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewSchedule({
                              date: request.reviewSession?.date ? request.reviewSession.date.split('T')[0] : '',
                              time: request.reviewSession?.time || '10:00 AM'
                            });
                          }}
                          style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)', color: '#bfdbfe', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Review Controls
                        </button>
                        <button
                          onClick={async () => {
                            setSelectedRequest(request);
                            const startedRequest = await handleStartReview(request, true);
                            if (!startedRequest) setShowVideoModal(false);
                          }}
                          style={{ background: 'rgba(100, 108, 255, 0.2)', border: '1px solid rgba(100,108,255,0.4)', color: '#93c5fd', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Start Video Test
                        </button>
                      </>
                    )}
                    {(proofs.includes('Basic Test') || proofs.includes('Assessment')) && (
                      <button onClick={() => { setSelectedRequest(request); setShowQuizModal(true); }} style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fcd34d', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Send Quiz
                      </button>
                    )}
                  </div>
                )}

                {selectedRequest?.requestId === request.requestId && proofs.includes('Live Interaction') && (
                  <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '180px', flex: 1 }}>
                      <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>Review Date</label>
                      <input type="date" value={reviewSchedule.date} onChange={(e) => setReviewSchedule((prev) => ({ ...prev, date: e.target.value }))} style={{ width: '100%', padding: '10px', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px' }} />
                    </div>
                    <div style={{ minWidth: '150px' }}>
                      <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>Review Time</label>
                      <input type="text" value={reviewSchedule.time} onChange={(e) => setReviewSchedule((prev) => ({ ...prev, time: e.target.value }))} placeholder="06:00 PM" style={{ width: '100%', padding: '10px', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px' }} />
                    </div>
                    <button onClick={() => handleScheduleReview(request)} style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      Schedule Review
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showVideoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#1f2937', padding: '30px', borderRadius: '16px', width: '95vw', height: '95vh', border: '1px solid #374151', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>🔴 Live Video Interaction</h3>
              <button onClick={closeVideoModal} style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>✖</button>
            </div>
            <div style={{ margin: '0 0 20px 0', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(100,108,255,0.15)', border: '1px solid rgba(100,108,255,0.3)', color: '#93c5fd', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>Skill: <strong style={{ color: '#fff' }}>{selectedRequest?.skillName}</strong></span>
              <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>Teacher: <strong style={{ color: '#fff' }}>{selectedRequest?.providerName}</strong></span>
              <span style={{ color: hasRemoteMedia ? '#6ee7b7' : '#fbbf24', fontSize: '0.9rem', marginLeft: 'auto' }}>{isPreparingCall ? 'Preparing devices...' : callStatus}</span>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
              <div style={{ flex: 2, background: '#000', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #374151', position: 'relative', overflow: 'hidden' }}>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: hasRemoteMedia ? 'block' : 'none' }} />
                {!hasRemoteMedia && (
                  <>
                    <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>📹</span>
                    <span style={{ fontSize: '1.2rem', color: '#93c5fd', animation: 'pulse 2s infinite' }}>{callStatus}</span>
                  </>
                )}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '8px', color: '#fff', border: '1px solid #374151' }}>
                  Teacher: <strong>{selectedRequest?.providerName}</strong>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ flex: 1, background: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #374151', position: 'relative', overflow: 'hidden' }}>
                  <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isCameraEnabled ? 1 : 0.25 }} />
                  {localMediaError && (
                    <div style={{ position: 'absolute', inset: 'auto 12px 12px 12px', background: 'rgba(0,0,0,0.75)', color: '#fbbf24', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid rgba(251,191,36,0.25)' }}>
                      {localMediaError}
                    </div>
                  )}
                  {!isCameraEnabled && <span style={{ position: 'absolute', fontSize: '2rem' }}>📷 Off</span>}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', border: '1px solid #374151' }}>
                    Admin (You)
                  </div>
                </div>

                <div style={{ flex: 2, background: '#111827', borderRadius: '12px', border: '1px solid #374151', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginTop: 0, color: '#e5e7eb', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Review Chat</h4>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                    <div style={{ alignSelf: 'center', color: '#10b981', padding: '4px 0', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>Ask practical questions and verify the teacher live.</div>
                    {sessionChat.map((msg, i) => (
                      <div key={i} style={{ alignSelf: msg.sender === (getAdminUser().name || 'Admin') ? 'flex-end' : 'flex-start', background: msg.sender === (getAdminUser().name || 'Admin') ? '#646cff' : '#374151', color: '#fff', padding: '8px 12px', borderRadius: '12px', fontSize: '0.9rem', maxWidth: '85%' }}>
                        {msg.sender !== (getAdminUser().name || 'Admin') && <strong style={{ display: 'block', fontSize: '0.75rem', marginBottom: '2px', color: '#aaa' }}>{msg.sender}</strong>}
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <input type="text" placeholder="Type a message and press Enter..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleSendChat} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={toggleMicrophone} disabled={!localStreamRef.current} style={{ background: isMicEnabled ? '#374151' : '#7f1d1d', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: localStreamRef.current ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', opacity: localStreamRef.current ? 1 : 0.55 }}>
                {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
              </button>
              <button onClick={toggleCamera} disabled={!localStreamRef.current} style={{ background: isCameraEnabled ? '#374151' : '#7f1d1d', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: localStreamRef.current ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', opacity: localStreamRef.current ? 1 : 0.55 }}>
                {isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              </button>
              <button onClick={() => handleApprove(selectedRequest)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                Approve Skill
              </button>
              <button onClick={() => handleReject(selectedRequest)} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                Reject Skill
              </button>
              <button onClick={handleEndReview} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                End Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Verification Modal */}
      {showCertificateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#1f2937', padding: '30px', borderRadius: '16px', width: '90vw', maxWidth: '800px', maxHeight: '90vh', border: '1px solid #374151', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>📄 Certificate Verification</h3>
              <button onClick={() => setShowCertificateModal(false)} style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>✖</button>
            </div>

            {/* Document Preview Area */}
            <div style={{ flex: 1, background: '#000', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: '400px', position: 'relative' }}>
              {selectedRequest?.certUrl ? (
                <iframe
                  src={selectedRequest.certUrl}
                  title="Certificate Document"
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                />
              ) : (
                <p style={{ color: '#9ca3af' }}>No document found or invalid format.</p>
              )}

              {/* Overlay Document Info & Download */}
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(31, 41, 55, 0.9)', padding: '15px 25px', borderRadius: '12px', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                <div>
                  <p style={{ color: '#fff', fontSize: '1rem', margin: '0 0 5px 0', fontWeight: '600' }}>{selectedRequest?.providerName}'s Certificate</p>
                  <span style={{ background: 'rgba(100,108,255,0.15)', color: '#93c5fd', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>Skill: {selectedRequest?.skillName}</span>
                </div>
                {selectedRequest?.certUrl && (
                  <a href={selectedRequest.certUrl} target="_blank" rel="noopener noreferrer" download style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#374151', border: '1px solid #4b5563', color: '#d1d5db', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.background = '#4b5563'} onMouseLeave={e => e.currentTarget.style.background = '#374151'}>
                      Download File
                    </button>
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Please verify the authenticity of this document.</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setShowCertificateModal(false)} style={{ background: 'transparent', color: '#d1d5db', border: '1px solid #374151', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
                  Close
                </button>
                <button onClick={() => handleReject(selectedRequest)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  Reject
                </button>
                <button onClick={() => handleApprove(selectedRequest)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                  Verify & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '92vw', border: '1px solid #374151' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Send 10-question quiz</h3>
            <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.9rem' }}>
              Verify <strong style={{ color: '#fff' }}>{selectedRequest?.skillName}</strong> knowledge for {selectedRequest?.providerName}.
            </p>
            <div style={{ background: '#111827', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #374151' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#d1d5db' }}>Select Question Bank to dispatch:</p>
              <select style={{ width: '100%', padding: '12px', background: '#1f2937', color: '#fff', border: '1px solid #4b5563', borderRadius: '6px', outline: 'none' }}>
                <option>Standard {selectedRequest?.skillName} Basics</option>
                <option>Advanced {selectedRequest?.skillName} Topics</option>
                <option>Custom Teacher Assessment</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowQuizModal(false)} style={{ background: 'transparent', color: '#d1d5db', border: '1px solid #374151', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => { alert('Quiz sent to user successfully.'); setShowQuizModal(false); }} style={{ background: '#646cff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Dispatch Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );

  const renderActiveSwapsPage = () => (
    <PageContainer title="Monitor Swaps" subtitle="Oversee active skill exchange sessions between users.">
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#9ca3af', background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px' }}>User A</th>
              <th style={{ padding: '16px' }}>User B</th>
              <th style={{ padding: '16px' }}>Exchanging Skills</th>
              <th style={{ padding: '16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {swapRecords.map((row) => (
              <tr key={row._id}>
                <TableCell><strong style={{ color: '#fff' }}>{row.requesterName}</strong></TableCell>
                <TableCell><strong style={{ color: '#fff' }}>{row.matchedProviderName || 'Pending Match'}</strong></TableCell>
                <TableCell>{row.requestedSkill}</TableCell>
                <TableCell>{row.status}</TableCell>
              </tr>
            ))}
            {swapRecords.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No swap records found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );

  const renderRatingsComplaintsPage = () => (
    <PageContainer title="Ratings and Complaints" subtitle="Monitor user ratings post-session and report issues to main admin.">
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#9ca3af', background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px' }}>Teacher</th>
              <th style={{ padding: '16px' }}>Skill Taught</th>
              <th style={{ padding: '16px' }}>Session Rating</th>
              <th style={{ padding: '16px' }}>Complaint</th>
              <th style={{ padding: '16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {ratingRecords.map((row) => (
              <tr key={row._id}>
                <TableCell><strong style={{ color: '#fff' }}>{row.teacherName}</strong></TableCell>
                <TableCell>{row.skillTaught}</TableCell>
                <TableCell>{typeof row.rating === 'number' ? row.rating.toFixed(1) : row.rating}</TableCell>
                <TableCell><span style={{ color: row.status === 'Flagged' ? '#ef4444' : '#d1d5db' }}>{row.complaint || 'None'}</span></TableCell>
                <TableCell>
                  <button
                    onClick={() => handleReportRating(row._id)}
                    style={{ background: row.status === 'Flagged' ? '#ef4444' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Report
                  </button>
                </TableCell>
              </tr>
            ))}
            {ratingRecords.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No rating records found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );

  const renderAdminReportsPage = () => (
    <PageContainer title="Admin Reports" subtitle="Overview of escalations sent to the main administration team.">
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Reports Sent" value={reportRecords.length} color="#ef4444" />
          <StatCard title="Resolved Issues" value={reportRecords.filter((item) => item.status === 'Resolved').length} color="#10b981" />
        </div>
        <div style={{ background: '#1f2937', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Recent Escalations</h3>
          {reportRecords.length === 0 ? (
            <p style={{ margin: 0, color: '#9ca3af' }}>No escalations have been created yet.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '24px', color: '#d1d5db', lineHeight: 2, fontSize: '1.05rem' }}>
              {reportRecords.slice(0, 6).map((report) => (
                <li key={report._id}>
                  Reported <strong>{report.targetUserName}</strong> for {report.reason.toLowerCase()}. Status: {report.status}.
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageContainer>
  );

  const renderUserLookupPage = () => {
    const filteredUsers = allUsers.filter(u => {
      const n = u.name || '';
      const e = u.email || '';
      return n.toLowerCase().includes(userSearchTerm.toLowerCase()) || e.toLowerCase().includes(userSearchTerm.toLowerCase());
    });

    return (
      <PageContainer title="User Lookup" subtitle="Search and review user profiles, skills, and platform history.">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            placeholder="Search by name or email..."
            value={userSearchTerm}
            onChange={e => setUserSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', outline: 'none' }}
          />
        </div>
        <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Role</th>
                <th style={{ padding: '16px' }}>Rating</th>
                <th style={{ padding: '16px' }}>Credits</th>
                <th style={{ padding: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #374151', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell><strong style={{ color: '#fff' }}>{u.name}</strong></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role || 'User'}</TableCell>
                  <TableCell><span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {u.rating > 0 ? u.rating.toFixed(1) : 'New'}</span></TableCell>
                  <TableCell><span style={{ color: '#10b981', fontWeight: 'bold' }}>{u.credits || 0}</span></TableCell>
                  <TableCell><button onClick={() => alert(`Reviewing profile for ${u.name}`)} style={{ background: 'transparent', border: '1px solid rgba(100,108,255,0.5)', color: '#93c5fd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>Review Profile</button></TableCell>
                </tr>
              ))}
              {filteredUsers.length === 0 && <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>No users found matching your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </PageContainer>
    );
  };

  const renderModerationRulesPage = () => (
    <PageContainer title="Moderation Guidelines" subtitle="Platform rules and standard operating procedures for Teacher Admins.">
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#10b981' }}>1. Skill Verification</h3>
          <p style={{ color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>Always cross-reference uploaded certificates with official issuers. If a user selects "Live Video Interaction", ensure a minimum of 5 conceptual questions are asked to verify proficiency before approving the skill.</p>
        </div>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#f59e0b' }}>2. Handling Bad Ratings</h3>
          <p style={{ color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>If a user receives a rating below 3.0, it gets flagged. Review the complaint log. If it involves abusive behavior, escalate to Main Admin immediately. If it's a teaching quality issue, issue a platform warning.</p>
        </div>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#ef4444' }}>3. Dispute Resolution</h3>
          <p style={{ color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>In case of no-shows during a scheduled swap, verify the chat logs. Refund the learning credit to the innocent party. Repeat offenders must be reported to the Main Admin.</p>
        </div>
      </div>
    </PageContainer>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* Left Sidebar */}
      <div className="admin-sidebar" style={{ width: '260px', background: '#1f2937', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100%', zIndex: 10, overflowY: 'auto' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '1.8rem' }}>🎓</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>Moderator</span>
        </div>
        <div style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Menu</p>
          <SidebarItem to="/admin/overview" label="Dashboard" icon="📊" active={location.pathname.endsWith('/overview') || location.pathname.endsWith('/admin')} />
          <SidebarItem to="/admin/verifications" label="Skill Approvals" icon="✅" active={location.pathname.includes('/verifications')} badgeCount={pendingRequests.length} />
          <SidebarItem to="/admin/swaps" label="Monitor Swaps" icon="🔄" active={location.pathname.includes('/swaps')} />

          <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', margin: '20px 0 8px', letterSpacing: '0.5px' }}>Quality Control</p>
          <SidebarItem to="/admin/ratings" label="Ratings & Complaints" icon="⭐" active={location.pathname.includes('/ratings')} />
          <SidebarItem to="/admin/users" label="User Lookup" icon="🔍" active={location.pathname.includes('/users')} />

          <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', margin: '20px 0 8px', letterSpacing: '0.5px' }}>System</p>
          <SidebarItem to="/admin/guidelines" label="Moderation Rules" icon="📜" active={location.pathname.includes('/guidelines')} />
          <SidebarItem to="/admin/reports" label="Escalations" icon="📄" active={location.pathname.includes('/reports')} />
        </div>
        <div style={{ padding: '20px', flexShrink: 0 }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s ease' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '70px', background: '#1f2937', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', position: 'sticky', top: 0, zIndex: 5 }}>
          <h2 style={{ color: '#e5e7eb', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>Teacher & Moderator Portal</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>Moderator Account</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981' }}>Active & Online</p>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>M</div>
          </div>
        </div>

        <div style={{ padding: '30px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Loading dashboard data...
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={renderOverviewPage()} />
              <Route path="verifications" element={renderVerificationPage()} />
              <Route path="swaps" element={renderActiveSwapsPage()} />
              <Route path="ratings" element={renderRatingsComplaintsPage()} />
              <Route path="users" element={renderUserLookupPage()} />
              <Route path="guidelines" element={renderModerationRulesPage()} />
              <Route path="reports" element={renderAdminReportsPage()} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAdmin;
