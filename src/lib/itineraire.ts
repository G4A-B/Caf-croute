import type { Lieu } from '../data/types.ts'

// Entrée de l'école : point de départ de toutes les minutes à pied
export const ADRESSE_ECOLE = '13 rue Poullain Duparc, 35000 Rennes'

function adresseComplete(lieu: Lieu): string {
  return `${lieu.nom}, ${lieu.adresse ?? ''}, Rennes`
}

// Lien Google Maps : itinéraire à pied depuis l'école, avec une étape s'il y a deux adresses
export function lienGoogleMaps(lieux: Lieu[]): string {
  const parametres = new URLSearchParams({
    api: '1',
    origin: ADRESSE_ECOLE,
    destination: adresseComplete(lieux[lieux.length - 1]),
    travelmode: 'walking',
  })
  if (lieux.length > 1) parametres.set('waypoints', lieux.slice(0, -1).map(adresseComplete).join('|'))
  return `https://www.google.com/maps/dir/?${parametres}`
}
