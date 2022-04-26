<template>
  <div class="editor-wrapper">
    <editor-content class='editor' :editor="editor" />
    <div class='submit' @click="checkText">
      <img :src="require('../assets/scanBtn.png')" alt="ScanButton">
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { Result } from '../types'
import { getShortLink } from '../utils';


export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Editor',
  components: {
    EditorContent
  },
  data: () => ({
    editor: null as Editor | null,
    text: '' as string,
    html: '' as string,
    data: {} as {[key: string]: Result }
  }),
  mounted() {
    document.addEventListener('click', this.selectSentence.bind(this))
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Link,
        Highlight.configure({
          HTMLAttributes: { class: 'plag-text' },
        }),
        Placeholder.configure({
          placeholder: 'Enter text to check…',
        }),
      ],
      editable: true,
      autofocus: true
    });

    (window as any).editor = this.editor;
  },
  beforeUnmount() {
    this.editor && this.editor.destroy()
  },
  methods: {
    async checkText() {
      if (!this.editor) return;
      this.$emit('startCheck');

      const text = this.editor.state.doc.textContent;
      const sentences = text.match(/[A-Z0-9].+?(?=(?<=\w{2,})\.|!|\?(?:\s[A-Z]|\n|$))/g);
      if (!sentences) return;

      await Promise.all(sentences.map(async(sentence) => {
        await axios.post('/api/search', { query: sentence })
          .then((res) => {
            const result = res.data;
            result.plagiarism && this.highlight(result);
            result.shortLink = getShortLink(result.link);
            result.plagiarism && this.$emit('addSentenceResult', result)
          })
          .catch((err) => { console.log(err); });
      }))

      this.$emit('showCheckResult');
    },
    selectSentence(e: Event) {
      const target = e.target as HTMLElement;
      if (target?.tagName !== 'MARK') return;
      
      let sentenceText = target.textContent || '';
      if (!this.data[sentenceText]) {
        sentenceText = Object.keys(this.data).find(key => key.includes(sentenceText)) || '';
      }

      this.selectText(sentenceText);
      this.$emit('selectSentence', this.data[sentenceText])
    },
    selectText(text: string) {
      if (!this.editor) return;
      const content = this.editor.getText();
      const from: number = content.indexOf(text);
      if (!(from >= 0)) return console.error('no from for selection', {text, content, data: this.data, index: content.indexOf(text)});
      this.editor.chain()
        .setTextSelection({ from: from + 1, to: from + text.length + 1 })
        .run();
    },
    highlight(result: Result) {
      if (!this.editor || !result.plagiarism) return;
      const text = this.editor.getText();
      const from: number = text.indexOf(result.test);

      this.data[result.test] = result;

      this.editor.chain()
        .setTextSelection({ from: from + 1, to: from + result.test.length + 1 })
        .setMark('highlight', { color: '#e3c4ca' })
        .run();
    },

  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.editor {
  width: 50vw;
  margin: 2em 1em 1em 2em;
  min-width: 500px;
  height: 80vh;
}

.ProseMirror {
  width: 100%;
  height: 100%;
  text-align: left;
  border-radius: 15px;
  padding: 15px;
  overflow: auto;
  background: white;
} 

.ProseMirror:focus-visible {
  outline: none;
}

/* Placeholder (at the top) */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.submit {
  width: 240px;
  margin: 1em auto;
  cursor: pointer;
}
.submit img {
  width: 100%;
  height: 100%;
}
mark {
  background-color: #E89BAC;
  padding: 0.125em 0;
  border-radius: 0.25em;
  box-decoration-break: clone;
}

</style>
