import { Result } from '@/types';
<template>
   <div class='check-result' v-if="checkCompleted">

    <h3 class='check-result-header'>Check Result</h3>

    <div class='check-content'>

      <div class='check-result-data'>
        
        <div class="check-result-item" v-for="result of results" v-bind:key='result'>
          <div class='check-result-plagiarism'>
            <div class='check-result-plagiarism-number'>
              <h3>{{ getPlagiarism(result.plagiarism) }}</h3>
            </div>
          </div>

          <div class='check-result-link'>
            <div>{{ result.shortLink }}</div>
          </div>
        </div>

      </div>
      
      <div class='plagiarism-count'>
        <div class='plagiarism-number'>
          <h3>{{ getTotalPlagiarism(results) }}</h3>
        </div>
        <div class='plagiarism-text'>total</div>
      </div>

    </div>
    
  </div>
</template>

<script lang='ts'>
import { getPlagiarism } from '../utils/index';
import { Result } from '../types';
import { PropType } from 'vue';

export default {
  name: "CheckResult",
  setup() {
    return {
      getPlagiarism
    }
  },
  props: {
    results: {
      type: Array as PropType<Result[]>,
      required: true,
    },
    checkCompleted: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    getTotalPlagiarism(results: Result[]): string {
      if (!results.length) return '0%';
      const total = results.reduce((acc: number, result): number => acc + result.plagiarism, 0) || 0;
      return total + '%';
    },
  }
}
</script>

<style>
.check-content {
  display: flex;
}
.check-result {
  width: 100%;
  height: 56%;
  align-items: center;
  background: #ffffff50;
  border-radius: 15px;
  margin-top: 1em;
  backdrop-filter: blur(20px);
}
.check-result-data {
  width: 70%;
  text-align: left;
}
.check-result-item {
  display: flex;
}

.check-result-header {
  margin: 1em 0;
}

.check-result-plagiarism {
  width: 30%;
  color: #D9090980;
  font-size: 16px;
  font-weight: 'bold';
  position: relative;
  top: -10%;
}
.check-result-plagiarism-number {
  display: flex;
  justify-content: center;
  align-items: center;
}
.check-result-link {
  width: 70%;
  font-weight: medium;
  padding-left: 20px;
}

.link {
  width: 100%;
  color: tomato;
  text-decoration: none;
  margin: 0 5px;
  font-size: 12px;
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
}
</style>