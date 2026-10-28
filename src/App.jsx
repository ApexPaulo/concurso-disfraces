import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Skull,
  Crown,
  Flame,
  ShieldAlert,
  Lock,
  LogOut,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Wifi,
  Copy,
  Check,
  Trophy,
  Ghost,
  Users,
  Vote
} from 'lucide-react';
import { SpookyDecorations } from './components/SpookyDecorations';

function getOrCreateVoterId() {
  const key = 'halloween_contest_voter_id_v1';
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'voter-' + Math.random().toString(36).substring(2) + '-' + Date.now();
    localStorage.setItem(key, id);
  }
  return id;
}

function compressImageFile(file, maxDimension = 1100, quality = 0.84) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [voterId] = useState(getOrCreateVoterId);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('halloween_admin_token') || '');
  const [viewMode, setViewMode] = useState('voter'); // 'voter' | 'admin-login' | 'admin-panel'

  // Estado sincronizado con el servidor
  const [contestState, setContestState] = useState({
    revealed: false,
    totalVotes: null,
    totalParticipants: 0,
    myVote: null,
    participants: [],
    winners: [],
    localIp: 'localhost'
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Formulario nuevo participante
  const [participantName, setParticipantName] = useState('');
  const [costumeName, setCostumeName] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [submittingParticipant, setSubmittingParticipant] = useState(false);

  // Confirmación de voto para usuario normal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState(false);

  // Modal de imagen ampliada
  const [lightboxParticipant, setLightboxParticipant] = useState(null);

  // Copiar link Wi-Fi
  const [copiedWifi, setCopiedWifi] = useState(false);

  // Control de confetti al revelar resultados
  const prevRevealedRef = useRef(false);

  const isAdmin = Boolean(adminToken);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const fetchState = useCallback(async () => {
    try {
      const params = new URLSearchParams({ voterId });
      if (adminToken) params.set('adminToken', adminToken);
      const res = await fetch(`/api/state?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setContestState(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [voterId, adminToken]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Lanzar confetti tenebroso/dorado cuando se revelan los resultados
  useEffect(() => {
    if (contestState.revealed && !prevRevealedRef.current && contestState.winners?.length > 0) {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f97316', '#a855f7', '#fbbf24', '#ef4444']
      });
    }
    prevRevealedRef.current = contestState.revealed;
  }, [contestState.revealed, contestState.winners]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || 'Usuario o contraseña incorrectos');
        return;
      }
      localStorage.setItem('halloween_admin_token', data.token);
      setAdminToken(data.token);
      setUsername('');
      setPassword('');
      setViewMode('admin-panel');
      showToast('Bienvenido al Altar del Administrador');
    } catch {
      setLoginError('Error de conexión con el servidor');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('halloween_admin_token');
    setAdminToken('');
    setViewMode('voter');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setImagePreview(compressed);
    } catch (err) {
      showToast(err.message || 'Error al cargar la imagen', true);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!participantName.trim() || !imagePreview) {
      showToast('Debes ingresar el nombre del participante y subir la foto de su disfraz.', true);
      return;
    }
    setSubmittingParticipant(true);
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          name: participantName.trim(),
          costume: costumeName.trim(),
          imageData: imagePreview
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'No se pudo registrar al participante', true);
      } else {
        setContestState(data);
        setParticipantName('');
        setCostumeName('');
        setImagePreview('');
        showToast('¡Participante registrado en el concurso!');
      }
    } catch {
      showToast('Error de red al subir participante', true);
    } finally {
      setSubmittingParticipant(false);
    }
  };

  const handleDeleteParticipant = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a "${name}" del concurso?`)) return;
    try {
      const res = await fetch(`/api/admin/participants/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (res.ok) {
        setContestState(data);
        showToast(`Se eliminó a ${name}`);
      }
    } catch {
      showToast('No se pudo eliminar al participante', true);
    }
  };

  const handleToggleReveal = async (targetRevealed) => {
    try {
      const res = await fetch('/api/admin/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ revealed: targetRevealed })
      });
      const data = await res.json();
      if (res.ok) {
        setContestState(data);
        showToast(
          targetRevealed
            ? '¡RESULTADOS REVELADOS! Todos los invitados ya pueden ver al ganador.'
            : 'Resultados ocultados nuevamente. Votación en curso.'
        );
      }
    } catch {
      showToast('Error al cambiar visibilidad de resultados', true);
    }
  };

  const handleResetVotes = async () => {
    if (
      !window.confirm(
        '¿Estás seguro de reiniciar TODOS los votos a cero y ocultar los resultados? Los participantes seguirán cargados.'
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/admin/reset-votes', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (res.ok) {
        setContestState(data);
        showToast('Todos los votos han sido reiniciados a cero.');
      }
    } catch {
      showToast('Error al reiniciar los votos', true);
    }
  };

  const handleCastVote = async (participantId) => {
    setVotingInProgress(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, participantId })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'No se pudo registrar tu voto', true);
      } else {
        setContestState(data);
        setSelectedCandidate(null);
        showToast('¡Tu voto secreto ha sido registrado en el caldero!');
      }
    } catch {
      showToast('Error de conexión al enviar tu voto', true);
    } finally {
      setVotingInProgress(false);
    }
  };

  const networkUrl = `http://${contestState.localIp || window.location.hostname}:${window.location.port || 5173}`;

  const copyWifiUrl = () => {
    navigator.clipboard?.writeText(networkUrl);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const myVotedParticipant = contestState.participants.find((p) => p.id === contestState.myVote);

  // Ordenar participantes: cuando los resultados están revelados (o en vista admin de tabla), podemos mostrar el ranking
  const sortedByVotes = [...contestState.participants].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  return (
    <div className="halloween-app">
      <SpookyDecorations />

      {/* Barra Superior */}
      <header className="top-navbar">
        <div className="brand-area" onClick={() => setViewMode('voter')} role="button" tabIndex={0}>
          <div className="brand-icon-wrap">
            <Skull className="brand-skull-icon" size={28} />
          </div>
          <div>
            <span className="brand-eyebrow">NOCHE DE BRUJAS</span>
            <h1 className="brand-title">Concurso de Disfraces</h1>
          </div>
        </div>

        <div className="nav-actions">
          {isAdmin ? (
            <>
              <button
                type="button"
                className={`btn-nav ${viewMode === 'voter' ? 'active' : ''}`}
                onClick={() => setViewMode('voter')}
              >
                <Vote size={16} />
                <span>Vista Invitados</span>
              </button>
              <button
                type="button"
                className={`btn-nav btn-admin-switch ${viewMode === 'admin-panel' ? 'active' : ''}`}
                onClick={() => setViewMode('admin-panel')}
              >
                <Flame size={16} />
                <span>Panel Admin</span>
              </button>
              <button type="button" className="btn-nav btn-logout" onClick={handleAdminLogout} title="Cerrar sesión de Admin">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-nav btn-secret-admin"
              onClick={() => setViewMode(viewMode === 'admin-login' ? 'voter' : 'admin-login')}
            >
              <Lock size={15} />
              <span>{viewMode === 'admin-login' ? 'Volver a Votación' : 'Acceso Admin'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Notificaciones flotantes */}
      {errorMsg && (
        <div className="toast-banner toast-error">
          <ShieldAlert size={20} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="toast-banner toast-success">
          <Sparkles size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="main-container">
        {/* ==================== VISTA LOGIN ADMIN ==================== */}
        {viewMode === 'admin-login' && !isAdmin && (
          <section className="admin-login-card glass-panel">
            <div className="card-glow-header">
              <Lock className="header-icon-accent" size={34} />
              <h2>Cripta del Administrador</h2>
              <p>Solo el anfitrión del concurso puede gestionar participantes y revelar los votos.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="spooky-form">
              <div className="form-group">
                <label htmlFor="admin-user">Usuario</label>
                <input
                  id="admin-user"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-pass">Contraseña Secreta</label>
                <input
                  id="admin-pass"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {loginError && <div className="form-error-box">{loginError}</div>}

              <div className="form-buttons-row">
                <button type="button" className="btn-secondary" onClick={() => setViewMode('voter')}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Flame size={18} />
                  <span>Entrar al Panel</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==================== PANEL DE ADMINISTRADOR ==================== */}
        {viewMode === 'admin-panel' && isAdmin && (
          <div className="admin-dashboard">
            {/* Banner Wi-Fi y Control Maestro de Revelación */}
            <section className="admin-hero-bar glass-panel">
              <div className="wifi-share-box">
                <div className="wifi-badge">
                  <Wifi size={18} />
                  <span>Red Local Wi-Fi Activa</span>
                </div>
                <h3>Comparte este enlace con los invitados en tu mismo Wi-Fi:</h3>
                <div className="wifi-url-Copy">
                  <code>{networkUrl}</code>
                  <button type="button" className="btn-copy" onClick={copyWifiUrl}>
                    {copiedWifi ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedWifi ? '¡Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <a
                    href="/qr-concurso.png"
                    download="qr-concurso-disfraces.png"
                    className="btn-copy"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Descargar QR</span>
                  </a>
                </div>
                <p className="wifi-hint">
                  Los invitados entran directo sin contraseña ni registro y solo pueden votar 1 vez.
                </p>
              </div>

              <div className="reveal-master-box">
                <div className="status-indicator-row">
                  <span className={`status-pill ${contestState.revealed ? 'status-revealed' : 'status-hidden'}`}>
                    {contestState.revealed ? (
                      <>
                        <Eye size={15} /> Resultados Públicos
                      </>
                    ) : (
                      <>
                        <EyeOff size={15} /> Votos Ocultos al Público (Sorpresa Activa)
                      </>
                    )}
                  </span>
                </div>

                {!contestState.revealed ? (
                  <button
                    type="button"
                    className="btn-reveal-grand"
                    onClick={() => handleToggleReveal(true)}
                    disabled={contestState.participants.length === 0}
                  >
                    <Crown size={22} />
                    <span>¡DAR A CONOCER LOS RESULTADOS!</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-hide-results"
                    onClick={() => handleToggleReveal(false)}
                  >
                    <EyeOff size={18} />
                    <span>Ocultar Resultados y Reabrir Votación</span>
                  </button>
                )}

                <div className="admin-quick-stats">
                  <div>
                    <strong>{contestState.totalParticipants}</strong> Concursantes
                  </div>
                  <span>•</span>
                  <div>
                    <strong>{contestState.totalVotes ?? 0}</strong> Votos Totales
                  </div>
                  <button
                    type="button"
                    className="btn-reset-link"
                    onClick={handleResetVotes}
                    title="Reiniciar todos los votos a 0"
                  >
                    <RefreshCw size={13} /> Reiniciar votos
                  </button>
                </div>
              </div>
            </section>

            <div className="admin-grid-2col">
              {/* Columna 1: Subir nuevo participante */}
              <section className="glass-panel admin-card">
                <div className="section-title-row">
                  <Upload size={20} className="icon-orange" />
                  <h2>Subir Participante</h2>
                </div>

                <form onSubmit={handleAddParticipant} className="spooky-form">
                  <div className="form-group">
                    <label htmlFor="p-name">Nombre del Participante *</label>
                    <input
                      id="p-name"
                      type="text"
                      placeholder="Ej. Carlos Mendoza"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="p-costume">Nombre o Temática del Disfraz (Opcional)</label>
                    <input
                      id="p-costume"
                      type="text"
                      placeholder="Ej. Conde Drácula Sangriento"
                      value={costumeName}
                      onChange={(e) => setCostumeName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fotografía del Disfraz *</label>
                    <label className="image-upload-dropzone" htmlFor="p-image-input">
                      {imagePreview ? (
                        <div className="upload-preview-wrapper">
                          <img src={imagePreview} alt="Vista previa del disfraz" />
                          <span className="change-photo-badge">Cambiar fotografía</span>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <Upload size={34} />
                          <span>Haz clic para elegir o tomar una foto</span>
                          <small>JPG, PNG o WEBP (se optimiza automáticamente)</small>
                        </div>
                      )}
                      <input
                        id="p-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary btn-full"
                    disabled={submittingParticipant}
                  >
                    <Sparkles size={18} />
                    <span>
                      {submittingParticipant ? 'Subiendo al Caldero...' : 'Registrar Concursante'}
                    </span>
                  </button>
                </form>
              </section>

              {/* Columna 2: Monitoreo de Votos en Tiempo Real (Exclusivo Admin) */}
              <section className="glass-panel admin-card">
                <div className="section-title-row">
                  <Trophy size={20} className="icon-orange" />
                  <div>
                    <h2>Progreso de Votos en Vivo</h2>
                    <p className="subtitle-muted">
                      Solo tú como Admin puedes ver estas barras antes de revelar al ganador.
                    </p>
                  </div>
                </div>

                {sortedByVotes.length === 0 ? (
                  <div className="empty-box-small">
                    <Ghost size={40} />
                    <p>Aún no has subido concursantes.</p>
                  </div>
                ) : (
                  <div className="admin-live-list">
                    {sortedByVotes.map((p, index) => (
                      <div
                        key={p.id}
                        className={`admin-vote-row ${p.isWinner ? 'leader-highlight' : ''}`}
                      >
                        <div className="admin-rank-num">#{index + 1}</div>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="admin-thumb"
                          onClick={() => setLightboxParticipant(p)}
                        />
                        <div className="admin-vote-info">
                          <div className="admin-vote-header">
                            <div>
                              <strong>{p.name}</strong>
                              {p.costume && <span className="costume-tag"> — {p.costume}</span>}
                              {p.isWinner && (
                                <span className="leader-Crown-badge">
                                  <Crown size={13} /> Líder Actual
                                </span>
                              )}
                            </div>
                            <div className="vote-numbers">
                              <span className="vote-count-pill">{p.votes ?? 0} votos</span>
                              <span className="vote-percent">{p.percentage ?? 0}%</span>
                            </div>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${p.percentage ?? 0}%` }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => handleDeleteParticipant(p.id, p.name)}
                          title="Eliminar concursante"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ==================== VISTA PRINCIPAL DE VOTACIÓN Y RESULTADOS (USUARIOS NORMALES) ==================== */}
        {viewMode === 'voter' && (
          <div className="voter-experience">
            {/* Banner Hero Tenebroso */}
            <section className="hero-halloween">
              <div className="hero-badge">
                <Ghost size={16} />
                <span>VOTACIÓN OFICIAL EN VIVO</span>
              </div>
              <h2 className="hero-spooky-heading">
                {contestState.revealed
                  ? '¡El Veredicto de las Sombras!'
                  : '¿Quién tiene el Disfraz más Terrorífico?'}
              </h2>
              <p className="hero-subtext">
                {contestState.revealed
                  ? 'Los votos secretos han salido a la luz. ¡Conoce al ganador de esta noche de Halloween!'
                  : 'Explora los disfraces de todos los participantes y elige tu favorito. ¡El conteo de votos es totalmente secreto hasta el gran final!'}
              </p>

              {/* Estado del voto del usuario actual */}
              {!contestState.revealed && myVotedParticipant && (
                <div className="my-vote-status-banner">
                  <CheckCircle2 size={20} className="icon-green" />
                  <span>
                    Ya emitiste tu voto secreto por <strong>{myVotedParticipant.name}</strong>
                    {myVotedParticipant.costume ? ` (${myVotedParticipant.costume})` : ''}. ¡Espera a
                    que el anfitrión revele al ganador!
                  </span>
                </div>
              )}

              {!contestState.revealed && !myVotedParticipant && contestState.participants.length > 0 && (
                <div className="mystery-notice-pill">
                  <EyeOff size={16} />
                  <span>
                    Modo Sorpresa Activo: Los votos están ocultos hasta que el Admin anuncie al ganador.
                  </span>
                </div>
              )}
            </section>

            {/* ==================== GRAN PODIO DEL GANADOR (CUANDO EL ADMIN REVELA RESULTADOS) ==================== */}
            {contestState.revealed && (
              <section className="winner-reveal-stage glass-panel">
                {contestState.winners && contestState.winners.length > 0 ? (
                  <>
                    <div className="winner-crown-header">
                      <Crown size={44} className="crown-animated" />
                      <span className="winner-kicker">
                        {contestState.winners.length > 1
                          ? '¡EMPATE TERRORÍFICO EN EL PRIMER LUGAR!'
                          : '¡GANADOR ABSOLUTO DEL CONCURSO DE DISFRACES!'}
                      </span>
                    </div>

                    <div className="winners-showcase-grid">
                      {contestState.winners.map((winner) => (
                        <div key={winner.id} className="winner-spotlight-card">
                          <div
                            className="winner-photo-frame"
                            onClick={() => setLightboxParticipant(winner)}
                          >
                            <img src={winner.imageUrl} alt={winner.name} />
                            <div className="winner-trophy-badge">
                              <Trophy size={20} />
                              <span>1° LUGAR</span>
                            </div>
                          </div>
                          <div className="winner-details">
                            <h3>{winner.name}</h3>
                            {winner.costume && <p className="winner-costume-title">“{winner.costume}”</p>}
                            <div className="winner-metrics">
                              <span className="winner-votes-big">{winner.votes} Votos</span>
                              <span className="winner-pct-badge">{winner.percentage}% del total</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-votes-yet-box">
                    <Skull size={38} />
                    <h3>Se revelaron los resultados, pero aún no se registraron votos.</h3>
                  </div>
                )}
              </section>
            )}

            {/* ==================== GALERÍA DE PARTICIPANTES ==================== */}
            {loading ? (
              <div className="loading-state glass-panel">
                <Ghost size={44} className="floating-icon" />
                <p>Invocando a los participantes desde el más allá...</p>
              </div>
            ) : contestState.participants.length === 0 ? (
              <div className="empty-contest-state glass-panel">
                <Ghost size={56} className="floating-icon" />
                <h3>Aún no hay disfraces en la cripta</h3>
                <p>
                  El administrador está subiendo las fotos de los concursantes. En cuanto los agregue,
                  aparecerán aquí automáticamente.
                </p>
              </div>
            ) : (
              <section className="participants-section">
                <div className="participants-section-header">
                  <div className="participants-count-badge">
                    <Users size={18} />
                    <span>{contestState.participants.length} Concursantes Participando</span>
                  </div>
                  {contestState.revealed && contestState.totalVotes !== null && (
                    <div className="total-votes-revealed-badge">
                      <Flame size={18} />
                      <span>Total de votos emitidos: {contestState.totalVotes}</span>
                    </div>
                  )}
                </div>

                <div className="participants-grid">
                  {(contestState.revealed ? sortedByVotes : contestState.participants).map(
                    (participant, idx) => {
                      const isMyChoice = contestState.myVote === participant.id;
                      const hasAlreadyVoted = Boolean(contestState.myVote);

                      return (
                        <article
                          key={participant.id}
                          className={`costume-card glass-panel ${
                            isMyChoice ? 'card-my-vote' : ''
                          } ${contestState.revealed && participant.isWinner ? 'card-winner-glow' : ''}`}
                        >
                          <div
                            className="costume-image-container"
                            onClick={() => setLightboxParticipant(participant)}
                          >
                            <img
                              src={participant.imageUrl}
                              alt={`Disfraz de ${participant.name}`}
                              loading="lazy"
                            />
                            <div className="image-zoom-hint">Toca para ampliar</div>

                            {contestState.revealed && (
                              <div className="rank-corner-badge">#{idx + 1}</div>
                            )}

                            {contestState.revealed && participant.isWinner && (
                              <div className="winner-ribbon">
                                <Crown size={15} />
                                <span>GANADOR</span>
                              </div>
                            )}

                            {isMyChoice && (
                              <div className="my-choice-ribbon">
                                <CheckCircle2 size={15} />
                                <span>Tu Voto</span>
                              </div>
                            )}
                          </div>

                          <div className="costume-card-body">
                            <h3 className="participant-name">{participant.name}</h3>
                            {participant.costume ? (
                              <p className="participant-costume-name">{participant.costume}</p>
                            ) : (
                              <p className="participant-costume-name muted">Disfraz de Halloween</p>
                            )}

                            {/* Si los resultados YA fueron revelados por el Admin, mostrar conteo y barra */}
                            {contestState.revealed ? (
                              <div className="public-result-stats">
                                <div className="public-result-numbers">
                                  <strong>{participant.votes ?? 0} votos</strong>
                                  <span>{participant.percentage ?? 0}%</span>
                                </div>
                                <div className="progress-track">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${participant.percentage ?? 0}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              /* Si los resultados NO han sido revelados, botón de votar (sin mostrar votos) */
                              <div className="card-vote-action">
                                {!hasAlreadyVoted ? (
                                  <button
                                    type="button"
                                    className="btn-vote-halloween"
                                    onClick={() => setSelectedCandidate(participant)}
                                  >
                                    <Flame size={18} />
                                    <span>Votar por este Disfraz</span>
                                  </button>
                                ) : isMyChoice ? (
                                  <div className="voted-locked-pill chosen">
                                    <CheckCircle2 size={17} />
                                    <span>Votaste por este disfraz</span>
                                  </div>
                                ) : (
                                  <div className="voted-locked-pill">
                                    <Lock size={15} />
                                    <span>Voto emitido</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* ==================== MODAL DE CONFIRMACIÓN DE VOTO ÚNICO ==================== */}
      {selectedCandidate && (
        <div className="modal-backdrop" onClick={() => !votingInProgress && setSelectedCandidate(null)}>
          <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-spooky">
              <Flame size={30} className="icon-orange" />
              <h3>¿Confirmar tu voto secreto?</h3>
            </div>
            <p className="modal-desc">
              Recuerda que <strong>solo puedes votar por un único participante</strong> en todo el
              concurso. Tu voto será secreto hasta el final.
            </p>
            <div className="modal-candidate-preview">
              <img src={selectedCandidate.imageUrl} alt={selectedCandidate.name} />
              <div>
                <h4>{selectedCandidate.name}</h4>
                {selectedCandidate.costume && <p>{selectedCandidate.costume}</p>}
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedCandidate(null)}
                disabled={votingInProgress}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleCastVote(selectedCandidate.id)}
                disabled={votingInProgress}
              >
                <CheckCircle2 size={18} />
                <span>{votingInProgress ? 'Sellando pacto...' : 'Sí, emitir mi voto'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== LIGHTBOX PARA VER FOTO DEL DISFRAZ EN GRANDE ==================== */}
      {lightboxParticipant && (
        <div className="modal-backdrop" onClick={() => setLightboxParticipant(null)}>
          <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxParticipant.imageUrl} alt={lightboxParticipant.name} />
            <div className="lightbox-caption">
              <div>
                <h3>{lightboxParticipant.name}</h3>
                {lightboxParticipant.costume && <p>{lightboxParticipant.costume}</p>}
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setLightboxParticipant(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
