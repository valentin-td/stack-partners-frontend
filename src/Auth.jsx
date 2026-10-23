import { useState } from 'react';

export default function Auth() {
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('reset_token');
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', siret_agent: '', numero_rsac: '', iban: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/partners';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    let endpoint = isLogin ? '/auth/login' : '/auth/register';
    let payload = formData;

    if (resetToken) {
      endpoint = '/auth/reset-password';
      payload = { token: resetToken, new_password: formData.mot_de_passe };
    } else if (showForgot) {
      endpoint = '/auth/forgot-password';
      payload = { email: formData.email };
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      
      if (resetToken) {
        setMessage('Mot de passe réinitialisé. Vous allez être redirigé.');
        setTimeout(() => window.location.href = '/login', 2500);
      } else if (showForgot) {
        setMessage('Un lien de réinitialisation a été envoyé à cette adresse.');
        setShowForgot(false);
      } else if (isLogin) {
        localStorage.setItem('partner_token', data.token);
        localStorage.setItem('partner_data', JSON.stringify(data.agent));
        window.location.href = '/dashboard';
      } else {
        setMessage('Inscription réussie. Votre compte est en attente de validation.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb', 
    borderRadius: '12px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '36px 32px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', border: '1px solid #e5e7eb', boxSizing: 'border-box' }}>
        
        {/* En-tête Logo STACK Partners */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #863bff 0%, #47bfff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px' }}>
            S
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.04em', color: '#111827' }}>STACK</span>
          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>Partners</span>
        </div>

        {/* Sélecteur Connexion / Inscription façon pilule */}
        {!resetToken && !showForgot && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            <button type="button" onClick={() => setIsLogin(true)} style={{ padding: '10px', borderRadius: '10px', border: isLogin ? 'none' : '1px solid #e5e7eb', backgroundColor: isLogin ? '#111827' : '#f3f4f6', color: isLogin ? '#ffffff' : '#6b7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Connexion
            </button>
            <button type="button" onClick={() => setIsLogin(false)} style={{ padding: '10px', borderRadius: '10px', border: !isLogin ? 'none' : '1px solid #e5e7eb', backgroundColor: !isLogin ? '#111827' : '#f3f4f6', color: !isLogin ? '#ffffff' : '#6b7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Devenir Agent
            </button>
          </div>
        )}
        {showForgot && <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#111827' }}>Réinitialiser le mot de passe</div>}
        {resetToken && <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#111827' }}>Nouveau mot de passe</div>}
        
        {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>{error}</div>}
        {message && <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && !showForgot && !resetToken && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="text" name="nom" placeholder="Nom" required onChange={handleChange} style={inputStyle} />
                <input type="text" name="prenom" placeholder="Prénom" required onChange={handleChange} style={inputStyle} />
              </div>
              <input type="text" name="telephone" placeholder="Téléphone" onChange={handleChange} style={inputStyle} />
              <input type="text" name="siret_agent" placeholder="Numéro SIRET (14 chiffres)" required onChange={handleChange} style={inputStyle} />
              <input type="text" name="numero_rsac" placeholder="Numéro RSAC (Optionnel)" onChange={handleChange} style={inputStyle} />
              <input type="text" name="iban" placeholder="IBAN (Pour vos virements)" required onChange={handleChange} style={inputStyle} />
            </>
          )}
          {!resetToken && (
            <input type="email" name="email" placeholder="Adresse e-mail" required onChange={handleChange} style={inputStyle} />
          )}
          {(!showForgot || resetToken) && (
            <input type="password" name="mot_de_passe" placeholder={resetToken ? "Nouveau mot de passe" : "Mot de passe"} required onChange={handleChange} style={inputStyle} />
          )}
          <button type="submit" style={{ marginTop: '8px', padding: '14px', backgroundColor: '#111827', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
            {resetToken ? 'Enregistrer' : showForgot ? 'Envoyer le lien' : isLogin ? 'Se connecter' : "Créer mon compte partenaire"}
          </button>
        </form>
        {isLogin && !resetToken && (
          <button type="button" onClick={() => setShowForgot(!showForgot)} style={{ marginTop: '16px', width: '100%', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline' }}>
            {showForgot ? "Retour à la connexion" : "Mot de passe oublié ?"}
          </button>
        )}
      </div>
    </div>
  );
}
