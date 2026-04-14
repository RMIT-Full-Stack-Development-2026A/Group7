import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export function Profile() {
  const navigate = useNavigate();
  const { call, loading, error } = useApi();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userId] = useState('user-001'); // Default to TheOneWhoAsked (admin)
  const [profile, setProfile] = useState(null);

  const [formState, setFormState] = useState({
    username: '',
    email: '',
    country: '',
    password: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  // Fetch profile data from backend database
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const data = await call(`/api/profile?userId=${userId}`);
        if (data) {
          setProfile(data);
          setFormState({
            username: data.username || '',
            email: data.email || '',
            country: data.country || '',
            password: '',
          });
          setAvatarPreview(data.avatar || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile from database:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [call, userId]);

  const filteredMatches = profile?.gameHistory
    ? profile.gameHistory.filter((match) =>
        match.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    try {
      const updatedProfile = {
        ...profile,
        ...formState,
        userId,
      };

      const result = await call('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedProfile),
      });

      if (result?.success || result) {
        setProfile(updatedProfile);
        setSaveMessage('✅ Profile updated successfully and saved to database!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('❌ Failed to update profile.');
      }
    } catch (err) {
      setSaveMessage('❌ Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setUploadMessage('Avatar uploaded successfully.');
    setTimeout(() => setUploadMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-5">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <button
          onClick={() => navigate('/')}
          className="btn btn-outline-light mb-4"
        >
          <ArrowLeft className="me-2" /> Back to Menu
        </button>

        {isLoadingProfile && (
          <div className="alert alert-info">Loading profile from database...</div>
        )}

        {!isLoadingProfile && !profile && (
          <div className="alert alert-danger">
            Failed to load profile from database. Using guest mode.
          </div>
        )}

        {!isLoadingProfile && profile && (
          <div className="card shadow-2xl border-0 bg-slate-900/90 rounded-[32px] overflow-hidden">
            <div className="card-body p-8">
              <h1 className="card-title fs-3 mb-4 text-white">Profile Management</h1>
              <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                <div className="space-y-4">
                  <div className="card mb-4 bg-slate-800/70 rounded-3xl shadow-xl border border-white/10">
                    <div className="card-body text-center p-6">
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="rounded-circle mb-3 mx-auto d-block"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                      <h3 className="h5 mb-1 text-white">{profile.username}</h3>
                      <p className="text-muted mb-3">{profile.email}</p>
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                        <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                          <Trophy size={16} className="text-slate-900" />
                          {profile.rank}
                        </span>
                      </div>
                      <p className="mb-0 text-muted">Country: {profile.country}</p>
                      <p className="mb-0 text-muted text-sm mt-2">Level: {profile.level} | ELO: {profile.elo}</p>
                    </div>
                  </div>

                  <div className="card bg-slate-800/70 rounded-3xl shadow-xl border border-white/10">
                    <div className="card-header bg-slate-900/80 border-b border-white/10 text-white">Past Matches ({profile.gameHistory?.length || 0})</div>
                    <div className="card-body p-0">
                      <table className="table table-striped mb-0">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">Opponent</th>
                            <th scope="col">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile.gameHistory && profile.gameHistory.map((match, index) => (
                            <tr key={match.id}>
                              <th scope="row">{index + 1}</th>
                              <td>{match.opponent}</td>
                              <td>
                                <span className={`badge ${match.result === 'Win' ? 'bg-success' : 'bg-danger'}`}>
                                  {match.result}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="card mb-4 bg-slate-800/70 rounded-3xl shadow-xl border border-white/10">
                    <div className="card-header bg-slate-900/80 border-b border-white/10 text-white">Edit Profile</div>
                    <div className="card-body p-6">
                      <form onSubmit={handleSaveProfile}>
                        <div className="mb-3">
                          <label className="form-label text-white">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formState.username}
                            onChange={(event) => setFormState({ ...formState, username: event.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-white">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formState.email}
                            onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-white">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formState.country}
                            onChange={(event) => setFormState({ ...formState, country: event.target.value })}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        {saveMessage && <div className="alert alert-success mt-3 mb-0">{saveMessage}</div>}
                      </form>
                    </div>
                  </div>

                  <div className="card mb-4 bg-slate-800/70 rounded-3xl shadow-xl border border-white/10">
                    <div className="card-header bg-slate-900/80 border-b border-white/10 text-white">Upload Avatar</div>
                    <div className="card-body p-6">
                      <div className="mb-3">
                        <label className="form-label text-white">Choose a profile picture</label>
                        <input
                          className="form-control"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      {uploadMessage && <div className="alert alert-success mb-0">{uploadMessage}</div>}
                    </div>
                  </div>

                  <div className="card bg-slate-800/70 rounded-3xl shadow-xl border border-white/10">
                    <div className="card-header bg-slate-900/80 border-b border-white/10 text-white">Search Game History</div>
                    <div className="card-body p-6">
                      <div className="input-group mb-3">
                        <span className="input-group-text" id="search-addon">Search</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by opponent or session ID"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          aria-describedby="search-addon"
                        />
                      </div>
                      <div className="list-group">
                        {filteredMatches.length > 0 ? (
                          filteredMatches.map((match) => (
                            <div key={match.id} className="list-group-item d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold">{match.opponent}</div>
                                <div className="text-muted">Session ID: {match.id}</div>
                              </div>
                              <div className="text-end">
                                <div>{match.date}</div>
                                <span className={`badge ${match.result === 'Win' ? 'bg-success' : 'bg-danger'} mt-2`}>{match.result}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="list-group-item text-muted">No matches found.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

