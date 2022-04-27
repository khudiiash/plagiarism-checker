const compare = (a: string, b: string): { plagiarism: number, matches: string[]} => {
  if (a.length < b.length) {
    [a, b] = [b, a];
  }
  const aw = a.toLowerCase().match(/\w+/g) || [];
  const bw = b.toLowerCase().match(/\w+/g) || [];
  const matches: string[] = [];

  for (let i = 0; i < aw.length; i++) {
    const w = aw[i];

    const bindices = getAllIndices(bw, w);

    for (const bindex of bindices) {
      let bi = bindex,
        ai = i;
      const locmatch = [];
      for (bi; bi < aw.length; bi++) {
        if (aw[ai] && bw.includes(aw[ai])) {
          locmatch.push(aw[ai]);
          ai++;
        }
      }
      if (locmatch.length > 3) {
        matches.push(locmatch.join(" "));
        i += locmatch.length;
      }
    }
  }

  if (!matches.length) return { plagiarism: 0, matches: []};

  const splitMatches = matches.filter((m) => /\w+/.test(m)).map((w) => w.trim()) as string[];
  const flat: string[] = splitMatches
    .flat()
    ?.map((s) => s.match(/\w+/g) || '')
    .flat();

  const length = flat?.length || 0;
  const longest = Math.max(aw.length, bw.length);
  const plagiarism = (length / longest) * 100;

  return { plagiarism, matches: flat };
};
const getAllIndices = (arr: string[], element: string): number[] => {
  const indices = [];

  for (let index = 0; index < arr.length; index++) {
    if (arr[index] === element) {
      indices.push(index);
    }
  }

  return indices;
};

export default compare;