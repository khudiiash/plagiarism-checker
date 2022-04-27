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
import compare from './utils/compare';
import {sentenceRE, snippetRE} from './utils/regex';

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
  matches?: string[],
  plagiarism: number,
}
let links = {} as { [link: string]: {body: string, title: string } };
let last = { link: '', plagiarism: 0, body: '', title: '' };

const analyzeLink = async ({link, snippet, title}: any, query: string): Promise<Result> => {
  let body = links[link]?.body;
  if (!body) {
    const html = await get(link, 5000); // get the link, wait up to 5 seconds
    if (!html?.data) return { plagiarism: 0, link };
    const $ = cheerio.load(html.data, { normalizeWhitespace: true });
    body = $('body').text() || '';
    links[link] = { body, title };
  }

  let res = analyze(query, snippet, body) as Result;
  const { plagiarism, matches, origin, test } = res;
  
  if (!origin) return { plagiarism, link };

  if (last.link === link && plagiarism < 20) {
    // in case the last link fails, reset last link and try again
    last.link = '';
    last.plagiarism = 0;
    const result = await getLink(query);
    if (!result) return { plagiarism: 0, link };
    return await analyzeLink(result, query);
  }
  
  if (plagiarism > 20 && link !== last.link) {
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
  return { link, title, plagiarism, matches, test, origin };
}

const google = async(query: string) => { 
  const config = {
    'query': query,
    'limit': 4,
    'no-display': true,
    'only-urls': false
  }

  return await googleIt(config).then((results: any): any => {
    if (!results.length) return null;

    results.forEach((r: any) => r.snippet = r.snippet.match(snippetRE)?.[0] || r.snippet);
    const similarities = results.map((result: any)=> compare(query, result.snippet).plagiarism);
    const most_similar = Math.max.apply(null, similarities);
    const index = similarities.indexOf(most_similar);

    return most_similar ? results[index] : null;
  }).catch((err: any) => console.log(err))
}

const getLink = async(query: string): Promise<any> => {
  const wordsCount = query.split(' ').length;
  if (wordsCount < 5) return null;
  if (last.plagiarism > 10) return last;
  const result = await google(`"${query}"`) || await google(query);
  return result;
}

// execute only one async function at a time to prevent "Too many requests" error
const queue = async.queue(async({query, onComplete}: any, done) => {
  const link = await getLink(query);
  if (!link) {
    onComplete({ link, plagiarism: 0, title: '', test: query, origin: '' });
    done();
    return;
  }
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