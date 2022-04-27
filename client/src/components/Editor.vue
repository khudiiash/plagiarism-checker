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
    activeSentence: [0, 0],
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
          multicolor: true,
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
      const sentences = text.match(/(?<!\()[A-Z0-9]([a-z0-9]+)?\s.*?(?=(?:\s\(.*\)\.|\.\s?[A-Z0-9]\s?[a-z0-9]|\.{3}|!|\?|$))/g);
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

      // this.selectText(sentenceText);
      this.$emit('selectSentence', this.data[sentenceText])
    },
    // selectText(text: string) {
    //   if (!this.editor) return;
    //   const content = this.editor.getText();
    //   const from: number = content.indexOf(text);
    //   const [activeFrom, activeTo] = this.activeSentence;

    //   if (activeFrom + activeTo > 0) {
    //      this.editor.chain()
    //       .setTextSelection({ from: activeFrom, to: activeTo })
    //       .unsetMark('highlight')
    //       .setTextSelection({ from: 0, to: 0 })
    //       .run();
    //   }
    //   this.activeSentence[0] = from + 1;
    //   this.activeSentence[1] = from + text.length + 1

    //   this.editor.chain()
    //     .setTextSelection({ from: this.activeSentence[0], to: this.activeSentence[1] })
    //     .setMark('highlight', { color: '#FFEB87' })
    //     .setTextSelection({ from: 0, to: 0 })
    //     .run();
    // },
    highlight(result: Result) {
      if (!this.editor || !result.plagiarism) return;
      const text = this.editor.getText();
      const from: number = text.indexOf(result.test);
      const length = result.test.length;
      const sentence =  text.slice(from, from + length);

      this.data[result.test] = result;

      const matches: string[] = result.matches || [];
      const testWords = result.test.match(/\w{3,}/g);
      
      result.origin.match(/\w{3,}/g)?.forEach(originMatch => {
        if (testWords?.includes(originMatch) && !matches.includes(originMatch)) {
          matches.push(originMatch);
          console.log('added match', originMatch);
        }
      })
      
      matches.forEach(match => {
        const mFrom = from + (new RegExp(` ${match}`, 'i').exec(sentence)?.index || 0);
        const mLength = match.length;
        if (mFrom === from) return;

        this.editor?.chain()
          .focus(mFrom + 2)
          .setTextSelection({ from: mFrom + 2, to: mFrom + mLength + 2 })
          .setMark('highlight')
          .setTextSelection({ from: mFrom + mLength + 2, to: mFrom + mLength + 2 })
          .run();
      })

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
  background-color: #ffbbca;
  box-decoration-break: clone;
}

</style>
