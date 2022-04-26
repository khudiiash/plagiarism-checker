<template>
  <div class='sentence-result' :style="{display: test ? 'flex' : 'none'}">
    <div class='sentence-data'>
    
      <div class='sentence-data-item'>
        <h3>Our Sentence</h3>
        <div class='sentence-data-text' :title="test">{{ getShortSentence(test) }}</div>
      </div>

      <div class='sentence-data-item'>
        <h3>Source Sentence</h3>
        <div class='sentence-data-text' :title="origin">{{ getShortSentence(origin) }}</div>
      </div>

      <div class='sentence-data-item sentence-source'>

        <div class='sentence-source-half'>
          <h3>Source</h3>
          <div class='sentence-data-text'>{{ shortLink }}</div>
        </div>

        <div class='link'>
          <a :href="link" target="_blank">
            <img :src="require('../assets/goBtn.png')" alt="Go">
          </a>
        </div>

      </div>
    </div>
    <div class='plagiarism-count'>
      <div class='plagiarism-number'>
        <h3>{{ getPlagiarism(plagiarism) }}</h3>
      </div>
      <div class='plagiarism-text'>plagiarized</div>
    </div>
  </div>
</template>

<script lang='ts'>
import { getPlagiarism, getShortSentence } from '../utils';
export default {
  name: "SentenceResult",
  setup: () => {
    return {
      getPlagiarism,
      getShortSentence
    }
  },
  props: {
    test: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    shortLink: {
      type: String,
      required: true,
    },
    plagiarism: {
      type: Number,
      required: true,
    },
  }
}
</script>

<style>
.sentence-result {
  width: 100%;
  min-height: 33%;
  height: fit-content;
  display: flex;
  display: flex;
  align-items: center;
  background: #ffffff50;
  border-radius: 15px;
  backdrop-filter: blur(20px);
}

h3 {
  font-size: 1.2em;
  margin: 0;
  padding: 0;
}

.sentence-source {
  display: flex;
  align-items: flex-start;
}

.sentence-source-half {
  width: 100%
}

.link img {
  width: 90px;
  height: 40px;
}

.link a {
  width: 90px;
  height: 100%;
  float: right;
}

.sentence-data {
  width: 100%;
  height: 100%;
  padding-top: 1em;
  text-align: left;
}

.sentence-data-item {
  width: 90%;
  margin: 0 0 0.5em 1em;
  height: fit-content;
}

.sentence-data-text {
  color: #11111175;
}

.plagiarism-count {
  color: #D9090975;
  height: 80%;
  width: 25%;
  text-align: center;
  font-size: 20px;
  border-left: 1px solid #00000020;
}
.plagiarism-count .plagiarism-number {
  color: #D9090980;
  font-size: 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

}
.plagiarism-count .plagiarism-text {
  color: #D9090980;
  font-size: 16px;
  position: relative;
  top: -10%;
}
  

</style>