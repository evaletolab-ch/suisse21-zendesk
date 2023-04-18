<template>
  <div id="app">
    <swiss21-zendesk />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Swiss21Zendesk from './components/Swiss21Zendesk.vue';
import { $zendesk, Context } from './services/ZendeskContext';


@Component({
  components: {
    Swiss21Zendesk
  },
})
export default class App extends Vue {


  latest: Context|null = null

  mounted(){

      //
      // subscribe zendesk context
      // - context version (to compare)
      // - ticket content
      $zendesk.observable().subscribe(async (context:Context)=>{
        // reset state
        this.latest = context;
      });
  }

}
</script>

<style>
  body{
    margin: 2px;
  }
  
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #2c3e50;
    margin-top: 0px;
    margin: 0;
    font-size: 14px;
  }

  .hide{
    display: none;
  }

  .container{
    border-bottom: 1px solid #eee;
    text-align: left;
    padding-left: 0px;    
  }

  button{
    width: 100%;
    margin: 10px 0;
    padding: 10px 20px;    
  }

  .error{
    padding: 20px;
    background: #eee;
    border: 1px solid red;
    width: calc( 100% - 50px );
  }

  .apps header .logo{
    width: 150px!important;
    height: 100%!important;
  }

</style>
