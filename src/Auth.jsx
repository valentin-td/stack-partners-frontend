import { useState } from 'react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', siret_agent: '', numero_rsac: '', iban: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/partners';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      
      if (isLogin) {
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

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Connexion Partenaire' : 'Devenir Agent Stack'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isLogin && (
          <>
            <input type="text" name="nom" placeholder="Nom" required onChange={handleChange} />
            <input type="text" name="prenom" placeholder="Prénom" required onChange={handleChange} />
            <input type="text" name="telephone" placeholder="Téléphone" onChange={handleChange} />
            <input type="text" name="siret_agent" placeholder="SIRET" required onChange={handleChange} />
            <input type="text" name="numero_rsac" placeholder="Numéro RSAC (Optionnel)" onChange={handleChange} />
            <input type="text" name="iban" placeholder="IBAN pour commissions" required onChange={handleChange} />
          </>
        )}
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="mot_de_passe" placeholder="Mot de passe" required onChange={handleChange} />
        
        <button type="submit" style={{ padding: '10px', background: 'black', color: 'white', cursor: 'pointer' }}>
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
      
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
        {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  );
}
