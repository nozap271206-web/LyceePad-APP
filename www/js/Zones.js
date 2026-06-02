/**
 * Zones.js - Page "Toutes les zones du lycée"
 */

const ZonesPage = {

  async init() {
    await this.render();
  },

  async render() {
    const container = document.getElementById('allZonesContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Chargement des zones...</div>';

    const { zones, source } = await this._fetchZones();

    if (!zones || zones.length === 0) {
      container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-exclamation-triangle"></i> Aucune zone disponible.</div>';
      return;
    }

    const sourceLabel = source === 'db'
      ? '<span class="zones-source zones-source--server"><i class="fas fa-cloud"></i> Synchronisé avec le serveur</span>'
      : '<span class="zones-source zones-source--local"><i class="fas fa-database"></i> Données locales</span>';

    const groups = new Map();
    zones.forEach(z => {
      const key = (z.batiment && z.batiment.trim()) ? z.batiment.trim() : 'Général';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(z);
    });

    const batimentIcons = {
      'Bâtiment C':    'fa-school',
      'Bâtiment Sud':  'fa-building',
      'Bâtiment Nord': 'fa-building',
      'Bâtiment FB':   'fa-building',
      'Bâtiment Est':  'fa-building',
      'Internat':      'fa-bed',
      'Général':       'fa-map-marker-alt',
    };

    const groupsHtml = Array.from(groups.entries()).map(([bat, zonesList]) => {
      const icon = batimentIcons[bat] || 'fa-building';
      const timelineHtml = zonesList.map((z, i) => {
        const etage = z.etage ? `<span><i class="fas fa-layer-group"></i> ${z.etage}</span>` : '';
        const desc  = z.description ? `<span>${z.description}</span>` : '';
        const href = z.contentId != null
          ? `ZoneContent.html?id=${z.contentId}`
          : (z.qr_code ? `ZoneContent.html?qr=${encodeURIComponent(z.qr_code)}` : null);
        const hasContent = !!href;
        const inner = `
          <div class="zone-step-number">${i + 1}</div>
          <div class="zone-step-content">
            <div class="zone-step-name">${z.nom}${hasContent ? ' <i class="fas fa-chevron-right zone-step-arrow"></i>' : ''}</div>
            <div class="zone-step-meta">${etage}${desc}</div>
            ${z.qr_code ? `<span class="zone-step-qr">${z.qr_code}</span>` : ''}
          </div>`;
        return hasContent
          ? `<a href="${href}" class="zone-step zone-step--link">${inner}</a>`
          : `<div class="zone-step">${inner}</div>`;
      }).join('');

      return `
        <div class="batiment-section">
          <div class="step-header">
            <span class="step-number"><i class="fas ${icon}" style="font-size:0.85rem"></i></span>
            <h2>${bat}</h2>
            <span class="parcours-badge"><i class="fas fa-map-marker-alt"></i> ${zonesList.length} zone${zonesList.length > 1 ? 's' : ''}</span>
          </div>
          <div class="zones-timeline">${timelineHtml}</div>
        </div>`;
    }).join('');

    container.innerHTML = sourceLabel + groupsHtml;
  },

  async _fetchZones() {
    try {
      await window.DBManager?.ready;
      if (window.DBManager?.state?.db) {
        const zones = await window.DBManager.getActiveZones();
        if (zones && zones.length > 0) {
          const source = window.DBManager.state.serverReachable ? 'db' : 'json';
          return { zones, source };
        }
      }
    } catch (_) {}

    try {
      const res   = await fetch('../data/qr-data.json');
      const json  = await res.json();
      const zones = Object.values(json.zones || {})
        .filter(z => z.actif !== false)
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
      if (zones.length > 0) return { zones, source: 'json' };
    } catch (_) {}

    return { zones: this._staticZones(), source: 'static' };
  },

  _staticZones() {
    return [
      { id:'29', qr_code:'QR_AMPHITHÉATRE_001', nom:'Amphithéatre',            description:"Amphithéatre de l'établissement", batiment:'',            etage:'',           ordre:0  },
      { id:'1',  qr_code:'QR_HALL_001',         nom:"Hall d'accueil/Vie scolaire", description:"Point d'entrée principal du lycée", batiment:'',      etage:'',           ordre:1  },
      { id:'2',  qr_code:'QR_CDI_001',          nom:'CDI',                     description:"Centre de Documentation et d'Information", batiment:'Bâtiment C', etage:'1er étage', ordre:2  },
      { id:'3',  qr_code:'QR_CAFET_001',        nom:'Cafétéria',               description:'Espace de restauration et de convivialité', batiment:'Bâtiment C', etage:'RDC',       ordre:3  },
      { id:'26', qr_code:'QR_C_ETAGE_1',        nom:'Bâtiment C - 1er étage',  description:'Premier étage - Bâtiment C',   batiment:'Bâtiment C', etage:'1er étage',  ordre:50 },
      { id:'27', qr_code:'QR_C_ETAGE_2',        nom:'Bâtiment C - 2ème étage', description:'Second étage - Bâtiment C',    batiment:'Bâtiment C', etage:'2ème étage', ordre:51 },
      { id:'28', qr_code:'QR_C_ETAGE_3',        nom:'Bâtiment C - 3ème étage', description:'Troisième étage - Bâtiment C', batiment:'Bâtiment C', etage:'3ème étage', ordre:52 },
      { id:'4',  qr_code:'QR_SUD_05',           nom:'Salle Sud 05',            description:'Salle de cours - Bâtiment Sud', batiment:'Bâtiment Sud', etage:'RDC',      ordre:10 },
      { id:'5',  qr_code:'QR_SUD_06',           nom:'Salle Sud 06',            description:'Salle de cours - Bâtiment Sud', batiment:'Bâtiment Sud', etage:'RDC',      ordre:11 },
      { id:'6',  qr_code:'QR_SUD_07',           nom:'Salle Sud 07',            description:'Salle de cours - Bâtiment Sud', batiment:'Bâtiment Sud', etage:'RDC',      ordre:12 },
      { id:'7',  qr_code:'QR_SUD_08',           nom:'Salle Sud 08',            description:'Salle de cours - Bâtiment Sud', batiment:'Bâtiment Sud', etage:'RDC',      ordre:13 },
      { id:'9',  qr_code:'QR_LABO_SUD',         nom:'Labo Sud',                description:'Laboratoire - Bâtiment Sud',   batiment:'Bâtiment Sud', etage:'RDC',      ordre:15 },
      { id:'10', qr_code:'QR_FB_10',            nom:'Salle FB 10',             description:'Salle de cours - Bâtiment FB', batiment:'Bâtiment FB', etage:'RDC',       ordre:20 },
      { id:'11', qr_code:'QR_FB_11',            nom:'Salle FB 11',             description:'Salle de cours - Bâtiment FB', batiment:'Bâtiment FB', etage:'RDC',       ordre:21 },
      { id:'12', qr_code:'QR_FB_20',            nom:'Salle FB 20',             description:'Salle de cours - Bâtiment FB', batiment:'Bâtiment FB', etage:'1er étage', ordre:22 },
      { id:'13', qr_code:'QR_FB_21',            nom:'Salle FB 21',             description:'Salle de cours - Bâtiment FB', batiment:'Bâtiment FB', etage:'1er étage', ordre:23 },
      { id:'14', qr_code:'QR_NORD_08',          nom:'Salle Nord 08',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'RDC',   ordre:30 },
      { id:'15', qr_code:'QR_NORD_09',          nom:'Salle Nord 09',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'RDC',   ordre:31 },
      { id:'16', qr_code:'QR_NORD_10',          nom:'Salle Nord 10',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'RDC',   ordre:32 },
      { id:'17', qr_code:'QR_NORD_11',          nom:'Salle Nord 11',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'RDC',   ordre:33 },
      { id:'18', qr_code:'QR_NORD_12',          nom:'Salle Nord 12',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'1er étage', ordre:34 },
      { id:'19', qr_code:'QR_NORD_13',          nom:'Salle Nord 13',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'1er étage', ordre:35 },
      { id:'20', qr_code:'QR_NORD_14',          nom:'Salle Nord 14',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'1er étage', ordre:36 },
      { id:'21', qr_code:'QR_NORD_15',          nom:'Salle Nord 15',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'1er étage', ordre:37 },
      { id:'22', qr_code:'QR_NORD_16',          nom:'Salle Nord 16',           description:'Salle de cours - Bâtiment Nord', batiment:'Bâtiment Nord', etage:'1er étage', ordre:38 },
      { id:'23', qr_code:'QR_EST_11',           nom:'Salle Est 11',            description:'Salle de cours - Bâtiment Est', batiment:'Bâtiment Est', etage:'RDC',    ordre:40 },
      { id:'24', qr_code:'QR_EST_12',           nom:'Salle Est 12',            description:'Salle de cours - Bâtiment Est', batiment:'Bâtiment Est', etage:'RDC',    ordre:41 },
      { id:'25', qr_code:'QR_EST_13',           nom:'Salle Est 13',            description:'Salle de cours - Bâtiment Est', batiment:'Bâtiment Est', etage:'RDC',    ordre:42 },
      { id:'30', qr_code:'QR_INTERNAT_001',     nom:'Internat',                description:'Internat',                     batiment:'Internat',     etage:'',         ordre:55, contentId: 10 },
    ];
  }
};

document.addEventListener('DOMContentLoaded', () => ZonesPage.init());
