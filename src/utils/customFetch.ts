import axios, { AxiosInstance } from "axios";

const TRANSPORT_API: string = "https://impactco2.fr/api/v1/transport";
const CITY_API: string = "https://photon.komoot.io/api/";
const TRANSPORT_DETAILS_API: string = "https://impactco2.fr/api/v1/thematiques/ecv/4?detail=1&language=en";

interface TransportParams {
  km: number;
  displayAll: number;
  ignoreRadiativeForcing: number;
  occupencyRate: number;
  includeConstruction: number;
  language: string;
}

export const transportCustomFetch: AxiosInstance = axios.create({
    baseURL: TRANSPORT_API,
    params: {
      km: 100,
      displayAll: 0,
      ignoreRadiativeForcing: 0,
      occupencyRate: 1,
      includeConstruction: 0,
      language: "en",
    } as TransportParams
});

export const transportDetailsFetch: AxiosInstance = axios.create({
    baseURL: TRANSPORT_DETAILS_API,
});

export const cityCustomFetch: AxiosInstance = axios.create({
    baseURL: CITY_API,
});
