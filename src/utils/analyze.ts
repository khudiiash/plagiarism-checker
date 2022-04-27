
import compare from "./compare";
import { sentenceRE } from "./regex";
export const analyze = (test: string, snippet: string, origin: string) => {
  if (!test || !origin) return { plagiarism: 0 };
  if (origin.includes(test)) return { plagiarism: 100, test, origin: test };

  const sentences = origin.match(sentenceRE);

  const snippetSentence = snippet && sentences?.find((s) => s.includes(snippet) || snippet.includes(s));

  if (snippetSentence) {
    const { plagiarism, matches } = compare(test, snippetSentence);
    return { plagiarism, matches, test, origin: snippetSentence };
  }
  
  if (!sentences) return { plagiarism: 0 };
  let plagSentence = '';
  let plagMatches: string[] = [];
  const plagiarism = sentences.reduce((max, sentence) => {
    const {plagiarism, matches} = compare(test, sentence);
    
    if (plagiarism > max) {
      plagSentence = sentence;
      plagMatches = matches;
      return plagiarism;
    }

    return max;
  }, 0);

  return { plagiarism: plagiarism, matches: plagMatches, test, origin: plagSentence };
}

