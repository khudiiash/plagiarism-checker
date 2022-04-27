export interface Result {
  link: string,
  shortLink: string,
  text: string,
  test: string,
  origin: string,
  plagiarism: number,
  matches: string[],
  title?: string,
}