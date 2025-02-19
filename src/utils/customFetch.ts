import axios from "axios";

const transportAPI = "https://impactco2.fr/api/v1/transport";
const cityAPI = "https://photon.komoot.io/api/";
const distanceApiUrl = "https://impactco2.fr/api/callGMap";

export const transportCustomFetch = axios.create({
    baseURL: transportAPI,
    params: {
      km: 100,
      displayAll: 0,
      ignoreRadiativeForcing: 0,
      occupencyRate: 1,
      includeConstruction: 0,
      language: "en",
    }
});

export const cityCustomFetch = axios.create({
    baseURL: cityAPI,
});

export const tripDistanceFetch = axios.create({
    baseURL: distanceApiUrl,
    headers: { "Authorization": "Bearer 5da2a7d3-addf-4b3f-baae-7dfa2ef5b9a4"}
});
