<template>
  <div class='app' :style="cssProps">
    <Editor
      @selectSentence="showSentenceResult"
      @showCheckResult="showCheckResult"
      @addSentenceResult="addSentenceResult"
      @startCheck="startCheck"
    />
    <div class='results'>
      <SentenceResult
        :plagiarism="sentence.plagiarism"
        :test="sentence.test"
        :origin="sentence.origin"
        :link="sentence.link"
        :shortLink="sentence.shortLink"
      />
      <CheckResult 
        :checkCompleted="checkCompleted" 
        :results="results"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import gsap from 'gsap';

import Editor from './components/Editor.vue';
import CheckResult from './components/CheckResult.vue';
import SentenceResult from './components/SentenceResult.vue';

import { Result } from './types';
import { getShortLink } from './utils';

export default defineComponent({
  name: 'App',
  components: {
    Editor,
    CheckResult,
    SentenceResult
  },
  data: () => ({
    text: '',
    sentence: {} as Result,
    results: [] as Result[],
    totalPlagiarism: 0,
    checkCompleted: false,
    cssProps: {
      backgroundImage: `url(${require('./assets/background.png')})`,
    }
  }),
  methods: {
    showSentenceResult(result: Result) {
      this.sentence = {...result};
    },
    addSentenceResult(result: Result) {
      this.results.push(result);
    },
    showCheckResult() {
      this.summarizeResults();
      this.checkCompleted = true;
    },
    summarizeResults() {
      this.totalPlagiarism = this.results.reduce((acc, cur) => acc + cur.plagiarism, 0);
      this.results = this.results.sort((a, b) => b.plagiarism - a.plagiarism);
      const sumResults: Result[] = [];

      this.results.forEach((result: Result) => {
        if (sumResults.some(r => r.shortLink === result.shortLink)) return;
        result.plagiarism = this.getTotalPlagiarismForLink(result.shortLink);
        sumResults.push(result);
      });

      this.results = sumResults;
    },
    getTotalPlagiarismForLink(shortLink: string) {
      const results = this.results.filter(result => getShortLink(result.shortLink) === shortLink);
      const total = results.reduce((acc, result: Result) => acc + (result.plagiarism / 100), 0) / results.length * 100;
      return total
    },
    startCheck() {
      gsap.timeline()
      .to('.editor-wrapper', 1, { x: 0, ease: 'power2.inOut' })
      .from('.results', 1, { x: '100%', opacity: 0, ease: 'power2.inOut' }, '-=0.5')
      this.checkCompleted = false;
      this.results = [];
      this.totalPlagiarism = 0;
    },
  },

  mounted() {
    gsap.set('.editor-wrapper', { x: window.innerWidth / 4 - 32})
  }
});
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  overflow: hidden;
  margin: 0;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}

.app {
  width: 100vw;
  height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  background-size: cover;
}

.results {
  height: 100%;
  width: 45%;
  display: flex;
  margin: 2em 2em 1em 0em;
  flex-direction: column;
}
</style>
