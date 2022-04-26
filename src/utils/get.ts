import axios from "axios";

export function get(url: string, timeout: number = 5000): Promise<any> {
  const controller = new AbortController();
  return Promise.race([axios.get(url, {
    signal: controller.signal
  }).catch(() => controller.abort()), new Promise(resolve => {
    setTimeout(() => {
      resolve("request was not fulfilled in time");
      controller.abort();
    }, timeout)
  })]);
}