import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { getStoredUser, storeUser } from '../utils/auth';

// Helper for page container to ensure consistent spacing and animation
const PageContainer = ({ title, children }) => (
  <div className="page-content dashboard-page-container" style={{ textAlign: 'left', animation: 'fadeInUp 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{title}</h1>
    {children}
  </div>
);

export const FindSkills = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSwapSkill, setSelectedSwapSkill] = useState(null);
  const [swapDetails, setSwapDetails] = useState({ date: '', time: '10:00 AM', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // Fetch user data (for latest credits) and global skills from backend
    const fetchData = async () => {
      // Sync User Data
      const currentUser = getStoredUser();
      if (currentUser) {
        try {
          const userRes = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(currentUser.email)}`));
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            storeUser(userData);
            window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
          }
        } catch (e) {
          console.error("Failed to sync user data in Find Skills:", e);
        }
      }

      try {
        const response = await fetch(buildApiUrl(apiRoutes.platform.skills));
        if (response.ok) {
          const data = await response.json();
          // Assuming data is an array of { name: "User Name", skill: "Skill String", ... }
          if (Array.isArray(data)) {
            const validData = data.filter(item => item.status === 'Verified');

            const globalSkills = validData.map((item, index) => {
              // Parse the skill string format: "Name (Proficiency) [Proof...]"
              let skillName = item.skill || item.skillName || 'Unknown Skill';
              let level = 'Unknown';

              // Try to extract name and proficiency
              const match = typeof item.skill === 'string' ? item.skill.match(/^(.*?) \((.*?)\)/) : null;
              if (match) {
                skillName = match[1];
                level = match[2];
              }

              return {
                id: item._id || `global-${index}`,
                name: skillName,
                mentor: item.name || item.providerName || item.email || 'Community Member',
                providerEmail: item.email || item.providerEmail || null, // Capture email to send message later
                level: level,
                rating: typeof item.rating === 'number' ? item.rating.toFixed(1) : (item.rating || 'New'),
                image: item.image || '📚'
              };
            });
            setSkills(globalSkills); // Overwrite completely with real DB data
          }
        }
      } catch (error) {
        console.error("Failed to fetch global skills:", error);
      }
    };

    fetchData();
    // Real-time Database Sync (Updates every 5 seconds)
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredSkills = skills.filter(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleConfirmSwap = async (e) => {
    e.preventDefault();
    if (!user || !selectedSwapSkill) return;

    if (!swapDetails.date) {
      alert("Please select a proposed date.");
      return;
    }

    // Validate that the selected date and time are in the future
    const now = new Date();
    const selectedDateObj = new Date(swapDetails.date);
    const timeParts = swapDetails.time.match(/(\d+):(\d+)\s(AM|PM)/);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      if (timeParts[3] === 'PM' && hours < 12) hours += 12;
      if (timeParts[3] === 'AM' && hours === 12) hours = 0;
      selectedDateObj.setHours(hours, parseInt(timeParts[2], 10), 0, 0);
    }

    if (selectedDateObj <= now) {
      alert("The selected time has already passed. Please choose a future date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send the swap request (deduct credit)
      const response = await fetch(buildApiUrl('/api/user/swapRequests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          skillName: selectedSwapSkill.name,
          date: swapDetails.date,
          time: swapDetails.time,
          mentorEmail: selectedSwapSkill.providerEmail,
          mentorName: selectedSwapSkill.mentor,
          message: swapDetails.message
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Non-JSON Response from server:", text);
        throw new Error("Server returned an invalid HTML response instead of JSON.");
      }

      if (response.ok) {
        const updatedUser = data.user;
        setUser(updatedUser);
        storeUser(updatedUser);
        window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME

        // 2. Send the automatic schedule message to the skill provider
        if (selectedSwapSkill.providerEmail) {
          const initialMsg = `Hi! I'd like to request a swap to learn **${selectedSwapSkill.name}**. I am available on **${swapDetails.date}** around **${swapDetails.time}**. ${swapDetails.message ? '\n\n' + swapDetails.message : ''}`;
          await fetch(buildApiUrl('/api/messages'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderEmail: user.email, senderName: user.name, receiverEmail: selectedSwapSkill.providerEmail, message: initialMsg }) }).catch(err => console.error("Message send silently failed", err));
        }

        alert(`Swap scheduled! 1 credit deducted. Remaining credits: ${updatedUser.credits}. A message has been sent to the mentor.`);
        setShowSwapModal(false);
        setSwapDetails({ date: '', time: '10:00 AM', message: '' });
      } else {
        alert(data.message || "Insufficient credits! You need at least 1 credit to learn a new skill.");
      }
    } catch (error) {
      console.error("Error requesting swap:", error.message);
      alert(error.message || "Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Find Skills">
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search for a skill (e.g., React, Guitar)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
        />
      </div>
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {filteredSkills.map(skill => (
          <div key={skill.id} className="card" style={{ textAlign: 'left', padding: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{skill.image}</div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{skill.name}</h3>
            <p style={{ color: '#aaa', marginBottom: '1rem' }}>by {skill.mentor}</p>
            <div className="skill-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: 'auto' }}>
              <span style={{ background: 'rgba(100, 108, 255, 0.2)', color: '#646cff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>{skill.level}</span>
              <span style={{ color: '#fbbf24' }}>★ {skill.rating}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setSelectedSwapSkill(skill); setShowSwapModal(true); }}>Request Swap</button>
          </div>
        ))}
        {filteredSkills.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#aaa' }}>
            No approved skills available right now.
          </div>
        )}
      </div>

      {/* Schedule Swap Modal */}
      {showSwapModal && selectedSwapSkill && (
        <div className="modal-overlay" onClick={() => setShowSwapModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '500px' }}>
            <div className="modal-header" style={{ marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Schedule: {selectedSwapSkill.name}</h3>
              <button className="close-btn" onClick={() => setShowSwapModal(false)}>×</button>
            </div>
            <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem', marginTop: 0 }}>Propose a time to learn from <strong>{selectedSwapSkill.mentor}</strong>.</p>
            <form onSubmit={handleConfirmSwap} style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ color: '#d1d5db' }}>Proposed Date</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={swapDetails.date} onChange={e => setSwapDetails({ ...swapDetails, date: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff' }} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ color: '#d1d5db' }}>Time Slot</label>
                  <select value={swapDetails.time} onChange={e => setSwapDetails({ ...swapDetails, time: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff' }}>
                    <option>10:00 AM</option>
                    <option>02:00 PM</option>
                    <option>05:00 PM</option>
                    <option>08:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#d1d5db' }}>Introductory Message (Optional)</label>
                <textarea rows="3" placeholder="Hi! I am really interested in learning this because..." value={swapDetails.message} onChange={e => setSwapDetails({ ...swapDetails, message: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>
                {isSubmitting ? 'Sending Request...' : 'Send Swap Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export const MySkills = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSkills = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(storedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            storeUser(data);
            window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
          } else {
            setUser(storedUser);
          }
        } catch (e) {
          setUser(storedUser);
        }
      }
    };

    fetchUserSkills();
    // Real-time Database Sync (Updates every 5 seconds)
    const intervalId = setInterval(fetchUserSkills, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Skills...</div>;

  return (
    <PageContainer title="My Skills">
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="skill-card">
          <h3>🎓 Learning</h3>
          <ul className="skill-list">
            {user.skillsWanted && user.skillsWanted.length > 0 ? (
              user.skillsWanted.map((skill, idx) => (
                <li key={idx}>
                  <span>{skill}</span>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>In Progress</span>
                </li>
              ))
            ) : (
              <li style={{ justifyContent: 'center', color: '#aaa' }}>No skills added yet.</li>
            )}
          </ul>
          <button className="btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/dashboard/find-skills')}>Find More Skills</button>
        </div>
        <div className="skill-card">
          <h3>👨‍🏫 Teaching</h3>
          <ul className="skill-list">
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              user.skillsOffered.map((skill, idx) => (
                <li key={idx}>
                  <span>{skill}</span>
                  <span style={{ fontSize: '0.8rem', color: skill.includes('[Pending Approval') ? '#f59e0b' : '#10b981' }}>{skill.includes('[Pending Approval') ? 'Pending Approval' : 'Active'}</span>
                </li>
              ))
            ) : (
              <li style={{ justifyContent: 'center', color: '#aaa' }}>No teaching skills yet.</li>
            )}
          </ul>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/dashboard', { state: { openModal: 'offered' } })}>Add New Skill</button>
        </div>
      </div>
    </PageContainer>
  );
};

export const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChatEmail, setNewChatEmail] = useState('');
  const user = getStoredUser();
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (user) {
      try {
        const response = await fetch(buildApiUrl(`/api/messages/${encodeURIComponent(user.email)}`));
        if (response.ok) {
          const data = await response.json();
          const validData = Array.isArray(data) ? data : [];
          
          // Automatically merge and preserve old messages in the conversation list
          setConversations(prevConvs => {
            if (!prevConvs || prevConvs.length === 0) return validData;
            return validData.map(newConv => {
              const oldConv = prevConvs.find(c => c.email === newConv.email);
              if (oldConv) {
                let merged = oldConv.messages || [];
                if (newConv.messages && newConv.messages.length >= merged.length) {
                  merged = newConv.messages;
                } else if (newConv.messages && newConv.messages.length > 0) {
                  const newMsgs = newConv.messages.filter(nm => !merged.some(om => om.message === nm.message && om.senderEmail === nm.senderEmail));
                  merged = [...merged, ...newMsgs];
                } else if (newConv.lastMessage && newConv.lastMessage !== oldConv.lastMessage) {
                  if (!merged.some(m => m.message === newConv.lastMessage)) {
                    merged = [...merged, { senderEmail: newConv.email, message: newConv.lastMessage }];
                  }
                }
                return { ...oldConv, ...newConv, messages: merged };
              }
              return newConv;
            });
          });

          // Keep the active chat window updated without losing previous texts
          setSelectedConv(prev => {
            if (!prev) return null;
            const updated = validData.find(c => c.email === prev.email);
            if (updated) {
              let merged = prev.messages || [];
              if (updated.messages && updated.messages.length >= merged.length) {
                merged = updated.messages;
              } else if (updated.messages && updated.messages.length > 0) {
                const newMsgs = updated.messages.filter(nm => !merged.some(om => om.message === nm.message && om.senderEmail === nm.senderEmail));
                merged = [...merged, ...newMsgs];
              } else if (updated.lastMessage && updated.lastMessage !== prev.lastMessage) {
                if (!merged.some(m => m.message === updated.lastMessage)) {
                  merged = [...merged, { senderEmail: updated.email, message: updated.lastMessage }];
                }
              }
              return { ...prev, ...updated, messages: merged };
            }
            return prev;
          });
        } else {
          setConversations(prev => prev.length ? prev : []);
        }
      } catch (e) {
        console.error("Fetch messages failed", e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    // Real-time Database Sync
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages, selectedConv?.lastMessage]);

  const handleStartNewChat = (e) => {
    e.preventDefault();
    if (newChatEmail.trim()) {
      setSelectedConv({ email: newChatEmail, name: newChatEmail.split('@')[0], avatar: newChatEmail.charAt(0).toUpperCase(), color: '#10b981', lastMessage: 'Start typing...' });
      setNewChatEmail('');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user) return;
    try {
      const response = await fetch(buildApiUrl('/api/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: user.email,
          senderName: user.name,
          receiverEmail: selectedConv.email,
          message: newMessage
        })
      });
      if (response.ok) {
        setSelectedConv(prev => ({
          ...prev,
          lastMessage: newMessage,
          messages: [...(prev.messages || []), { senderEmail: user.email, message: newMessage }]
        }));
        setNewMessage('');
        fetchMessages(); // refresh immediately
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <PageContainer title="Messages">
      <div className="messages-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', minHeight: '500px' }}>
        <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '600px' }}>
          <form onSubmit={handleStartNewChat} style={{ display: 'flex', gap: '10px' }}>
            <input type="email" placeholder="Enter user email to chat..." value={newChatEmail} onChange={e => setNewChatEmail(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff' }} />
            <button type="submit" className="btn-primary" style={{ padding: '0 15px', borderRadius: '8px', fontSize: '0.9rem' }}>Chat</button>
          </form>
          <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0' }} />
          {loading ? <p style={{ textAlign: 'center', padding: '1rem' }}>Loading messages...</p> : conversations.length === 0 ? <p style={{ textAlign: 'center', padding: '1rem', color: '#aaa' }}>No messages yet. Start a new chat above!</p> : conversations.map(conv => (
            <div key={conv.id || conv.email} onClick={() => setSelectedConv(conv)} className="message-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px', borderRadius: '12px', background: selectedConv?.email === conv.email ? 'rgba(100,108,255,0.2)' : (conv.unread ? 'rgba(255,255,255,0.08)' : 'transparent'), cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseOver={(e) => { if (selectedConv?.email !== conv.email) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }} onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              <div className="avatar" style={{ background: conv.color, width: '45px', height: '45px', fontSize: '1rem' }}>{conv.avatar}</div>
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div className="message-row-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{conv.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{conv.time || 'New'}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: conv.unread ? '#e0e0e0' : '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{conv.lastMessage}</p>
              </div>
              {conv.unread && <div style={{ width: '10px', height: '10px', background: '#646cff', borderRadius: '50%', flexShrink: 0 }}></div>}
            </div>
          ))}
        </div>

        {selectedConv ? (
          <div className="card" style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden', background: '#1f2937', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)' }}>
              <div className="avatar" style={{ background: selectedConv.color, width: '40px', height: '40px', fontSize: '1rem', margin: 0 }}>{selectedConv.avatar}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedConv.name} <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'normal', marginLeft: '5px' }}>({selectedConv.email})</span></h3>
            </div>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {selectedConv.messages && selectedConv.messages.length > 0 ? (
              selectedConv.messages.map((msg, idx) => {
                const isMe = msg.senderEmail === user.email;
                return (
                  <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? '#646cff' : '#374151', padding: '10px 15px', borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0', maxWidth: '80%', color: '#fff', wordBreak: 'break-word' }}>
                    {msg.message}
                  </div>
                );
              })
            ) : (
              <div style={{ alignSelf: 'flex-start', background: '#374151', padding: '10px 15px', borderRadius: '15px 15px 15px 0', maxWidth: '80%', color: '#d1d5db' }}>
                {selectedConv.lastMessage === 'Start typing...' ? 'Send a message to start the conversation.' : selectedConv.lastMessage}
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #374151', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', background: '#111827', color: '#fff', outline: 'none' }} />
              <button type="submit" className="btn-primary" style={{ padding: '0 20px', borderRadius: '8px', fontWeight: 'bold' }}>Send</button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#aaa', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a contact from the list or start a new chat.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '', skillsWanted: [] });
  const isFirstLoad = useRef(true); // Preents overwriting user's typing during real-time sync
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(storedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            if (isFirstLoad.current) {
              setFormData({ name: data.name || '', bio: data.bio || '', skillsWanted: data.skillsWanted || [] });
              isFirstLoad.current = false;
            }
            storeUser(data);
            window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
          } else {
            setUser(storedUser);
            if (isFirstLoad.current) {
              setFormData({ name: storedUser.name || '', bio: storedUser.bio || '', skillsWanted: storedUser.skillsWanted || [] });
              isFirstLoad.current = false;
            }
          }
        } catch (e) {
          setUser(storedUser);
        }
      }
    };
    fetchProfile();
    // Real-time Database Sync
    const intervalId = setInterval(fetchProfile, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildApiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: formData.name, bio: formData.bio, skillsWanted: formData.skillsWanted }),
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server returned HTML instead of JSON. The backend route might be missing or incorrect.");
      }

      if (response.ok) {
        setUser(data.user);
        storeUser(data.user);
        window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Update failed:", error.message);
      alert(error.message || "Server error.");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const uploadData = new FormData();
    uploadData.append('email', user.email);
    uploadData.append('avatar', file);

    try {
      const response = await fetch(buildApiUrl('/api/user/avatar'), {
        method: 'POST',
        body: uploadData
      });
      
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch (err) { throw new Error("Server HTML error."); }

      if (response.ok) {
        setUser(data.user);
        storeUser(data.user);
        window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
      } else {
        alert(data.message || "Failed to update avatar.");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert(error.message || "Server error uploading avatar.");
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Profile...</div>;

  return (
    <PageContainer title="Profile Settings">
      <div className="dashboard-grid" style={{ marginTop: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="avatar" style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto 1.5rem', background: user.avatar ? `url(${buildApiUrl(user.avatar.replace(/\\/g, '/'))}) center/cover` : 'linear-gradient(135deg, #646cff, #bc13fe)' }}>
            {!user.avatar && (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>
          <h3>{user.name}</h3>
          <p style={{ color: '#aaa' }}>{user.email}</p>
          <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', color: '#fbbf24', fontWeight: 'bold' }}>{user.rating > 0 ? user.rating.toFixed(1) : 'New'} ★</div>
            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Average Rating ({user.ratingCount || 0} reviews)</div>
          </div>
          <div className="profile-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1.5rem' }}>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
            <button className="btn-outline" onClick={() => fileInputRef.current?.click()}>Change Avatar</button>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" defaultValue={user.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea rows="4" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..."></textarea>
            </div>
            <div className="form-group">
              <label>Skills Interests</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  id="newSkillInput" 
                  placeholder="Add a skill and press Enter..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val && !formData.skillsWanted.includes(val)) {
                        setFormData({ ...formData, skillsWanted: [...formData.skillsWanted, val] });
                        e.target.value = '';
                      }
                    }
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff' }}
                />
                <button type="button" className="btn-outline" onClick={() => {
                  const input = document.getElementById('newSkillInput');
                  const val = input.value.trim();
                  if (val && !formData.skillsWanted.includes(val)) {
                    setFormData({ ...formData, skillsWanted: [...formData.skillsWanted, val] });
                    input.value = '';
                  }
                }} style={{ padding: '0 15px' }}>Add</button>
              </div>
              <div className="profile-tags" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {formData.skillsWanted && formData.skillsWanted.length > 0 ? (
                  formData.skillsWanted.map((skill, idx) => (
                    <span key={idx} className="skill-tag" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {skill}
                      <span style={{ cursor: 'pointer', color: '#ff4d4d', fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }} onClick={() => setFormData({...formData, skillsWanted: formData.skillsWanted.filter((_, i) => i !== idx)})} title="Remove skill">×</span>
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>No skills added yet. Type above to add!</span>
                )}
              </div>
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Save Changes</button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};
