import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import async from 'async';
import * as cheerio from 'cheerio';
//@ts-ignore
import googleIt from 'google-it';

import { analyze, sleep } from './utils';
import { get } from './utils/get';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 9000;

app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))

interface Result {
  test?: string,
  origin?: string,
  title?: string, 
  link: string,
  plagiarism: number,
}
let links = {} as { [link: string]: {body: string, title: string } };
let last = { link: '', plagiarism: 0, body: '', title: '' };

const analyzeLink = async (link: string, query: string): Promise<Result> => {

  let body = links[link]?.body;
  let title = links[link]?.title;

  if (!body) {
    const html = await get(link, 5000); // get the link, wait up to 5 seconds
    if (!html?.data) return { plagiarism: 0, link };
    const $ = cheerio.load(html.data, { normalizeWhitespace: true });
    body = $('body').text();
    title =  $("title").text();
    links[link] = { body, title };
  }

  let res = analyze(query, body) as Result;
  const { plagiarism, origin, test } = res;
  
  if (!origin) return { plagiarism, link };

  if (last.link === link && plagiarism < 50) {
    // in case the last link fails, reset last link and try again
    last.link = '';
    last.plagiarism = 0;
    const link = await getLink(query);
    return await analyzeLink(link, query);
  }
  
  if (plagiarism > 80 && link !== last.link) {
    // in case the link found a lot of plagiarism, save it and try with the next query
    last.link = link;
    last.plagiarism = plagiarism;
  }

  const longSentence = (origin.match(/\w+/g)?.length || 0) > 30;
  // in case the link is too long, use first-3-words-last-3-words format
  const start = origin.split(' ').slice(0, 3).join(' ');
  const end = origin.split(' ').slice(-3).join(' ');
  const longLink = `#:~:text=${encodeURIComponent(start)},${encodeURIComponent(end)}.`;
  // otherwise, just add the whole sentence to the url
  const shortLink = `#:~:text=${encodeURIComponent(origin)}.`;
  link += longSentence ? longLink : shortLink;

  return { link, title, plagiarism, test, origin };
}

const google = async(query: string) => { 
  const config = {
    'query': query,
    'limit': 2,
    'no-display': true,
    'only-urls': true
  }
  return await googleIt(config).then((results: any): string => {
    return results.length ? results[0].link : '';
  }).catch((err: any) => console.log(err))
}

const getLink = async(query: string): Promise<any> => {
  if (last.plagiarism > 80) return last.link;
  return await google(`"${query}"`) || await google(query);;
}

// execute only one async function at a time to prevent "Too many requests" error
const queue = async.queue(async({query, onComplete}: any, done) => {
  const link = await getLink(query)
  const result = await analyzeLink(link, query);
  onComplete(result);
  done();
}, 1)

app.post('/search', async(req: Request, res: Response) => {
  const query = req.body.query;
  queue.push({query, onComplete: (result: Result) => res.send(result)});
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static( 'client/public' ))
  app.get('*', (req,res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});