// src/components/dashboard/TabProfil.jsx
// Onglet 6 : Parametres, conformite KYC (Yousign, RSAC, URSSAF, RC Pro, Quiz NF525)

import { Icon } from '../common/Icons';

export default function TabProfil({
  profilData,
  setProfilData,
  submitEtapeConformite,
  handleYousignSignature,
  handleCheckYousign,
  isYousignLoading,
  handleFileUpload,
  renderFilePreviewBadge,
  quizAnswers,
  setQuizAnswers,
  handleQuizSubmit,
  isMobile,
  primaryBtn,
  secondaryBtn,
  inputStyle,
  cardStyle
}) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>
            Paramètres & Dossier de Conformité
          </h1>
          <span style={{ fontSize: '13.5px', color: '#6b7280' }}>
            Validez les 6 étapes ci-dessous pour débloquer votre droit de prospection et facturation.
          </span>
        </div>
        <span
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '12.5px',
            fontWeight: '700',
            backgroundColor: profilData.autorise_a_vendre ? '#dcfce7' : '#f3f4f6',
            color: profilData.autorise_a_vendre ? '#166534' : '#374151',
            border: '1px solid #e5e7eb'
          }}
        >
          {profilData.autorise_a_vendre ? 'Compte Actif — Vente Autorisée' : 'Dossier en cours de validation'}
        </span>
      </div>

      {!profilData.autorise_a_vendre && profilData.motifs_blocage?.length > 0 && (
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon.Lock />
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: '700' }}>
                  Éléments requis pour débloquer votre droit de vente
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Complétez les étapes ci-dessous pour activer votre compte partenaire.
                </div>
              </div>
            </div>
            <span
              style={{
                padding: '5px 10px',
                borderRadius: '999px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                fontSize: '11.5px',
                fontWeight: '700'
              }}
            >
              {profilData.motifs_blocage.length} en attente
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '8px'
            }}
          >
            {profilData.motifs_blocage.map((motif, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #f3f4f6',
                  borderRadius: '11px',
                  fontSize: '12.5px',
                  fontWeight: '500'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    flexShrink: 0
                  }}
                />
                <span>{motif}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETAPE 1 */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
          <div style={{ fontSize: '15.5px', fontWeight: '700' }}>1. Contrat de mandat d'agent commercial</div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: '700',
              backgroundColor: profilData.statut_contrat === 'VALIDE' ? '#dcfce7' : '#fef3c7',
              color: profilData.statut_contrat === 'VALIDE' ? '#166534' : '#92400e'
            }}
          >
            {profilData.statut_contrat}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 14px 0' }}>
          Contrat conclu sous condition suspensive d'immatriculation RSAC.
        </p>
        {profilData.contrat_signe && profilData.statut_contrat === 'VALIDE' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon.Check /> Contrat signé électroniquement.
            </div>
            <button
              type="button"
              onClick={handleYousignSignature}
              disabled={isYousignLoading}
              style={secondaryBtn}
            >
              {isYousignLoading ? 'Génération...' : 'Relancer un test de signature Yousign'}
            </button>
          </div>
        ) : profilData.statut_contrat === 'EN_ATTENTE_SIGNATURE' ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCheckYousign}
              disabled={isYousignLoading}
              style={{ ...primaryBtn, backgroundColor: '#16a34a', width: isMobile ? '100%' : 'auto' }}
            >
              <Icon.Check /> {isYousignLoading ? 'Vérification...' : "J'ai signé, vérifier mon contrat"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (profilData.url_yousign_contrat) {
                  window.location.assign(profilData.url_yousign_contrat);
                } else {
                  handleYousignSignature();
                }
              }}
              disabled={isYousignLoading}
              style={{ ...secondaryBtn, width: isMobile ? '100%' : 'auto' }}
            >
              {isYousignLoading ? 'Ouverture...' : 'Ouvrir à nouveau le lien Yousign'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleYousignSignature}
            disabled={isYousignLoading}
            style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}
          >
            <Icon.Check /> {isYousignLoading ? 'Génération...' : 'Signer électroniquement le contrat de mandat'}
          </button>
        )}
      </div>

      {/* ETAPE 2 */}
      <div style={{ ...cardStyle, opacity: profilData.contrat_signe ? 1 : 0.6 }}>
        <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '14px' }}>
          2. Identité, SIRET & Immatriculation RSAC
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de naissance</label>
            <input
              type="date"
              value={profilData.date_naissance ? profilData.date_naissance.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_naissance: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiration Identité</label>
            <input
              type="date"
              value={profilData.date_expiration_identite ? profilData.date_expiration_identite.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_expiration_identite: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pièce d'identité</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileUpload(e, 'fichier_identite')}
              style={{ fontSize: '12px' }}
            />
            {renderFilePreviewBadge(profilData.fichier_identite, 'Identité')}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Numéro SIRET (14 chiffres)</label>
            <input
              type="text"
              value={profilData.siret_agent || ''}
              onChange={(e) => setProfilData({ ...profilData, siret_agent: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Forme juridique</label>
            <select
              value={profilData.forme_juridique || 'EI'}
              onChange={(e) => setProfilData({ ...profilData, forme_juridique: e.target.value })}
              style={inputStyle}
            >
              <option value="EI">Entrepreneur Individuel / Micro</option>
              <option value="SOCIETE">Société (SASU, EURL, SAS...)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Début d'activité</label>
            <input
              type="date"
              value={profilData.date_debut_activite ? profilData.date_debut_activite.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_debut_activite: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Adresse professionnelle complète</label>
          <input
            type="text"
            value={profilData.adresse_pro || ''}
            onChange={(e) => setProfilData({ ...profilData, adresse_pro: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Numéro RSAC</label>
            <input
              type="text"
              value={profilData.numero_rsac || ''}
              onChange={(e) => setProfilData({ ...profilData, numero_rsac: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Greffe / Tribunal</label>
            <input
              type="text"
              value={profilData.greffe_rsac || ''}
              onChange={(e) => setProfilData({ ...profilData, greffe_rsac: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date extrait RSAC</label>
            <input
              type="date"
              value={profilData.date_emission_rsac ? profilData.date_emission_rsac.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_emission_rsac: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Extrait RSAC (PDF)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileUpload(e, 'fichier_rsac')}
              style={{ fontSize: '12px' }}
            />
            {renderFilePreviewBadge(profilData.fichier_rsac, 'RSAC')}
          </div>
        </div>
        <button
          type="button"
          disabled={!profilData.contrat_signe}
          onClick={() => submitEtapeConformite(2)}
          style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}
        >
          <Icon.Check /> Enregistrer l'Étape 2
        </button>
      </div>

      {/* ETAPE 3 */}
      <div style={cardStyle}>
        <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '12px' }}>
          3. Attestation de vigilance URSSAF
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Code vérification URSSAF</label>
            <input
              type="text"
              value={profilData.code_verif_urssaf || ''}
              onChange={(e) => setProfilData({ ...profilData, code_verif_urssaf: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de délivrance</label>
            <input
              type="date"
              value={profilData.date_emission_urssaf ? profilData.date_emission_urssaf.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_emission_urssaf: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date d'expiration</label>
            <input
              type="date"
              value={profilData.date_expiration_urssaf ? profilData.date_expiration_urssaf.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_expiration_urssaf: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Fichier URSSAF</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileUpload(e, 'fichier_urssaf')}
              style={{ fontSize: '12px' }}
            />
            {renderFilePreviewBadge(profilData.fichier_urssaf, 'URSSAF')}
          </div>
        </div>
        <button
          type="button"
          onClick={() => submitEtapeConformite(3)}
          style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}
        >
          <Icon.Check /> Enregistrer l'Étape 3
        </button>
      </div>

      {/* ETAPE 4 */}
      <div style={cardStyle}>
        <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '12px' }}>
          4. Assurance RC Pro, IBAN, TVA & Charte
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Assureur (ex: AXA)"
            value={profilData.assureur_nom || ''}
            onChange={(e) => setProfilData({ ...profilData, assureur_nom: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="N° Police RC Pro"
            value={profilData.assureur_contrat || ''}
            onChange={(e) => setProfilData({ ...profilData, assureur_contrat: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Plafond garantie"
            value={profilData.assureur_plafond || ''}
            onChange={(e) => setProfilData({ ...profilData, assureur_plafond: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiration RC Pro</label>
            <input
              type="date"
              value={profilData.date_expiration_rc_pro ? profilData.date_expiration_rc_pro.slice(0, 10) : ''}
              onChange={(e) => setProfilData({ ...profilData, date_expiration_rc_pro: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Attestation RC Pro</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileUpload(e, 'fichier_rc_pro')}
              style={{ fontSize: '12px' }}
            />
            {renderFilePreviewBadge(profilData.fichier_rc_pro, 'RC Pro')}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="Titulaire de l'IBAN"
            value={profilData.titulaire_iban || ''}
            onChange={(e) => setProfilData({ ...profilData, titulaire_iban: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="IBAN"
            value={profilData.iban || ''}
            onChange={(e) => setProfilData({ ...profilData, iban: e.target.value })}
            style={inputStyle}
          />
          <select
            value={profilData.regime_tva || 'FRANCHISE_293B'}
            onChange={(e) => setProfilData({ ...profilData, regime_tva: e.target.value })}
            style={inputStyle}
          >
            <option value="FRANCHISE_293B">Franchise en base de TVA (293B)</option>
            <option value="ASSUJETTI_TVA">Assujetti à la TVA</option>
          </select>
        </div>
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '12px 14px',
            borderRadius: '12px',
            marginBottom: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12.5px'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!profilData.honneur_aucune_interdiction}
              onChange={(e) => setProfilData({ ...profilData, honneur_aucune_interdiction: e.target.checked })}
            />
            <span>Aucune interdiction de gérer ou d'exercer.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!profilData.honneur_pas_exclusivite_employeur}
              onChange={(e) => setProfilData({ ...profilData, honneur_pas_exclusivite_employeur: e.target.checked })}
            />
            <span>Aucune clause d'exclusivité employeur bloquante.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!profilData.honneur_pas_mandat_concurrent}
              onChange={(e) => setProfilData({ ...profilData, honneur_pas_mandat_concurrent: e.target.checked })}
            />
            <span>Aucun mandat concurrent non déclaré.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={!!profilData.charte_acceptee}
              onChange={(e) => setProfilData({ ...profilData, charte_acceptee: e.target.checked })}
            />
            <span>J'accepte la Charte Commerciale STACK (v1.0).</span>
          </label>
        </div>
        <button
          type="button"
          onClick={() => submitEtapeConformite(4)}
          style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}
        >
          <Icon.Check /> Enregistrer l'Étape 4
        </button>
      </div>

      {/* ETAPE 5 */}
      <form onSubmit={handleQuizSubmit} style={cardStyle}>
        <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '12px' }}>
          5. Quiz de Certification NF525 & Contact
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <select
            required
            value={quizAnswers.q1}
            onChange={(e) => setQuizAnswers({ ...quizAnswers, q1: e.target.value })}
            style={inputStyle}
          >
            <option value="">Q1. Quelle norme encadre la caisse STACK ?</option>
            <option value="nf525">La certification NF525 obligatoire</option>
            <option value="aucune">Aucune norme</option>
          </select>
          <select
            required
            value={quizAnswers.q2}
            onChange={(e) => setQuizAnswers({ ...quizAnswers, q2: e.target.value })}
            style={inputStyle}
          >
            <option value="">Q2. Un agent peut-il supprimer un ticket ?</option>
            <option value="interdit">Strictement interdit (séparation NF525)</option>
            <option value="autorise">Oui sur demande</option>
          </select>
          <select
            required
            value={quizAnswers.q3}
            onChange={(e) => setQuizAnswers({ ...quizAnswers, q3: e.target.value })}
            style={inputStyle}
          >
            <option value="">Q3. Votre statut vis-à-vis de STACK ?</option>
            <option value="mandataire">Mandataire indépendant</option>
            <option value="salarie">Salarié STACK</option>
          </select>
          <select
            required
            value={quizAnswers.q4}
            onChange={(e) => setQuizAnswers({ ...quizAnswers, q4: e.target.value })}
            style={inputStyle}
          >
            <option value="">Q4. Facturation des 99 € HT de mise en service ?</option>
            <option value="99">Facturés par l'agent au salon (mention RSAC)</option>
            <option value="stack">Encaissés par STACK</option>
          </select>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: '14px'
          }}
        >
          <input
            type="text"
            placeholder="Téléphone mobile actif"
            required
            value={profilData.telephone || ''}
            onChange={(e) => setProfilData({ ...profilData, telephone: e.target.value })}
            style={{ ...inputStyle, maxWidth: isMobile ? '100%' : '260px' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              required
              checked={!!profilData.telephone_confirme}
              onChange={(e) => setProfilData({ ...profilData, telephone_confirme: e.target.checked })}
            />
            <span>Je confirme que mes coordonnées sont actives.</span>
          </label>
        </div>
        <button type="submit" style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}>
          <Icon.Check /> Valider le Quiz NF525
        </button>
      </form>
    </>
  );
}
