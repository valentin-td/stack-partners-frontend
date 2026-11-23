// src/api/partnersApi.js
// Client API centralise pour le portail STACK Partners

import { API_URL } from './config';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur serveur (${res.status})`);
  }
  return data;
};

export const partnersApi = {
  // Statistiques dashboard & commissions
  async getDashboardStats(token) {
    const res = await fetch(`${API_URL}/dashboard-stats`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  // Factures onboarding 99 EUR
  async getFactures(token) {
    const res = await fetch(`${API_URL}/factures`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async createFacture(token, factureData) {
    const res = await fetch(`${API_URL}/factures`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(factureData)
    });
    return handleResponse(res);
  },

  async downloadFacturePdf(token, idFacture, numeroFacture) {
    const res = await fetch(`${API_URL}/factures/${idFacture}/pdf`, {
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Erreur lors du téléchargement du PDF.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_${numeroFacture || idFacture}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async sendFactureEmail(token, idFacture) {
    const res = await fetch(`${API_URL}/factures/${idFacture}/send-email`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async markFacturePaid(token, idFacture) {
    const res = await fetch(`${API_URL}/factures/${idFacture}/payee`, {
      method: 'PATCH',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  // Prospects & Leads
  async getProspects(token) {
    const res = await fetch(`${API_URL}/prospects`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async createProspect(token, prospectData) {
    const res = await fetch(`${API_URL}/prospects`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(prospectData)
    });
    return handleResponse(res);
  },

  async startOnboardingProspect(token, idProspect) {
    const res = await fetch(`${API_URL}/prospects/${idProspect}/onboarding`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  // Profil & KYC
  async getProfil(token) {
    const res = await fetch(`${API_URL}/profil`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async updateProfilEtape(token, payload) {
    const res = await fetch(`${API_URL}/profil/etape`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Contrat de mandat commercial electronique natif
  async getContrat(token) {
    const res = await fetch(`${API_URL}/profil/contrat`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async signContratNative(token, { signature_base64, consentement_lu }) {
    const res = await fetch(`${API_URL}/profil/contrat/signer`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ signature_base64, consentement_lu })
    });
    return handleResponse(res);
  },

  async downloadContratPdf(token, agentNom = 'AGENT') {
    const res = await fetch(`${API_URL}/profil/contrat/telecharger-pdf`, {
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors du téléchargement du contrat PDF.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrat_Mandat_STACK_${agentNom.toUpperCase().replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async adminDownloadContratPdf(token, idAgent, agentNom = 'AGENT') {
    const res = await fetch(`${API_URL}/admin/agents/${idAgent}/contrat-pdf`, {
      headers: getHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors du téléchargement du contrat PDF agent.');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrat_Mandat_STACK_${agentNom.toUpperCase().replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async initiateYousign(token) {
    const res = await fetch(`${API_URL}/profil/yousign/initiate`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async checkYousign(token) {
    const res = await fetch(`${API_URL}/profil/yousign/check`, {
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  // Simulateurs Sandbox
  async launchSandbox(token, type, action = 'LAUNCH') {
    const res = await fetch(`${API_URL}/sandbox/launch`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ type, action })
    });
    return handleResponse(res);
  },

  async purgeSandboxes(token) {
    const res = await fetch(`${API_URL}/sandbox/purge-all`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  // CRM Terrain, Visites et Tournees
  async saveVisite(token, payload) {
    const res = await fetch(`${API_URL}/visites`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async optimizeTournee(token, payload) {
    const res = await fetch(`${API_URL}/tournee/optimiser`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // God Mode Super-Admin
  async getAdminAgents(token) {
    const res = await fetch(`${API_URL}/admin/agents`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async getAdminCommissions(token) {
    const res = await fetch(`${API_URL}/admin/commissions`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async getAdminMarketStats(token) {
    const res = await fetch(`${API_URL}/admin/market-stats`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async getAdminTpeCommandes(token) {
    const res = await fetch(`${API_URL}/admin/tpe-commandes`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async adminValiderPiece(token, idAgent, payload) {
    const res = await fetch(`${API_URL}/admin/agents/${idAgent}/verifier-piece`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async adminPayerCommission(token, idCommission) {
    const res = await fetch(`${API_URL}/admin/commissions/${idCommission}/payer`, {
      method: 'PATCH',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async adminExpedierTpe(token, idCommande, payload) {
    const res = await fetch(`${API_URL}/admin/tpe-commandes/${idCommande}/expedier`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Interventions Techniques & Depannages Terrain
  async getInterventions(token) {
    const res = await fetch(`${API_URL}/interventions`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async accepterIntervention(token, idIntervention, creneauPassage) {
    const res = await fetch(`${API_URL}/interventions/${idIntervention}/accepter`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ creneau_passage: creneauPassage })
    });
    return handleResponse(res);
  },

  async resoudreIntervention(token, idIntervention, rapportIntervention) {
    const res = await fetch(`${API_URL}/interventions/${idIntervention}/resoudre`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ rapport_intervention: rapportIntervention })
    });
    return handleResponse(res);
  },

  // Leads Parrainage Ambassadeur
  async getLeadsAmbassadeurs(token) {
    const res = await fetch(`${API_URL}/leads-ambassadeurs`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  async reserverLeadAmbassadeur(token, idProspect) {
    const res = await fetch(`${API_URL}/leads-ambassadeurs/${idProspect}/reserver`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async confirmerRdvLeadAmbassadeur(token, idProspect, payload) {
    const res = await fetch(`${API_URL}/leads-ambassadeurs/${idProspect}/confirmer-rdv`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  }
};

export default partnersApi;
