export default function Dashboard() {
  const agent = JSON.parse(localStorage.getItem('partner_data') || '{}');

  const logout = () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_data');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Bienvenue, {agent.nom}</h1>
      <p>Statut du compte : <strong>{agent.statut}</strong></p>
      <p>Code Partenaire : <strong>{agent.code}</strong></p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
