import stringSimilarity from 'string-similarity';

export const analyze = (test: string, origin: string) => {
  if (!test || !origin) return { plagiarism: 0 };
  if (origin.includes(test)) return { plagiarism: 100, test, origin: test };
  const sentences = origin.match(/[A-Z0-9].+?(?=(?<=\w{2,})\.|!|\?(?:\s[A-Z]|\n|$))/g);

  if (!sentences) return { plagiarism: 0 };
  let plagSentence = '';
  const similarity = sentences.reduce((max, sentence) => {
    const similarity = stringSimilarity.compareTwoStrings(sentence, test);
    if (similarity > max) plagSentence = sentence;
    return similarity > max ? similarity : max;
  }, 0);

  return { plagiarism: similarity * 100, test, origin: plagSentence };
}