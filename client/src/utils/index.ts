
  export function getShortLink(link: string) {
    return link?.split('/')[2] || link;
  }
  
  export function getPlagiarism(plagiarism: number):string {
    return plagiarism >= 0 ? Math.round(plagiarism) + '%' : '0%';
  }

  export function getShortSentence(text: string): string {
    if (!text) return '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text + '.';
  }


