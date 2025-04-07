import axios from "axios";
import { AxiosFilteredResponse } from "../Interfaces";

axios.defaults.headers.common = {
  ...axios.defaults.headers.common,
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export class RequestManager {
  baseUrl: string;

  constructor(url: string) {
    this.baseUrl = url;
  }

  async get(
    urlExtension: string,
    query: string
  ): Promise<AxiosFilteredResponse> {
    try {
      const { status, data } = await axios
        .get(
          `${this.baseUrl}/${urlExtension}?timestamp=${Date.now()}${
            query.length ? `&${query}` : ""
          }`,
          { timeout: 10000 }
        )
        .catch(() => {
          return { status: 500, data: {} };
        });
      return { status, data };
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async post(query: any): Promise<AxiosFilteredResponse> {
    try {
      const { status, data } = await axios.post(this.baseUrl, query);
      return { status, data: data.data ?? data };
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}
