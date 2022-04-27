import axios from "axios";
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'last-modified': 'Tue, 22 Jun 2021 18:35:03 GMT',
  'server': 'cloudflare',
  'x-cdn': 'Imperva'
}
export function get(url: string, timeout: number = 5000): Promise<any> {
  const controller = new AbortController();
  return Promise.race([axios.get(url, {
    headers,
    signal: controller.signal
  }).catch(() => controller.abort()), new Promise(resolve => {
    setTimeout(() => {
      resolve("request was not fulfilled in time");
      controller.abort();
    }, timeout)
  })]);
}