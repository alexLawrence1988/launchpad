<template>
  <v-layout id="detail">
    <div id="visit-detail-vue" :data-visit="visit" :data-token="token"></div>
    <!-- built files will be auto injected -->
  </v-layout>
</template>

<script>
import settings from 'electron-settings';

export default {
  props: {
    visit: {
      type: String,
    },
  },
  computed: {
    token() {
      return settings.get('token', null);
    },
  },
  mounted() {
    const visitDetailScript = document.createElement('script');
    visitDetailScript.setAttribute('src', 'https://leadforensics-web-content.s3-eu-west-1.amazonaws.com/visit-detail-vue/js/visitDetail.js');
    document.body.appendChild(visitDetailScript);
  },
};
</script>

<style>
#detail {
  overflow: auto;
}
</style>
