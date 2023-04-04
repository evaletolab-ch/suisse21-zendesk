<template>
  <div id="app">
    <pilet-zendesk />

    <intervenant-finder       
      :query="query"
      :intervenantId="intervenantId" 
      v-on:intervenantSelected="onIntervenantSelected"/>

    <copro-finder 
      v-if="intervenant || refFormatee" 
      :intervenant="intervenant" 
      :refFormatee="refFormatee"
      :organization="organization"
      v-on:coproSelected="onCoproSelected"
      v-on:onClear="onClear"
    />

    <copro-display 
      v-if="refFormatee" 
      :refFormatee="refFormatee" 
      :organization="organization"
    />

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Swiss21Zendesk from './components/Swiss21Zendesk.vue';
import IntervenantFinder from './components/IntervenantFinder.vue';
import CoproFinder from './components/CoproFinder.vue';
import CoproDisplay from './components/CoproDisplay.vue';
import { $zendesk, Context } from './services/ZendeskContext';


@Component({
  components: {
    Swiss21Zendesk,
    IntervenantFinder,
    CoproFinder,
    CoproDisplay
  },
})
export default class App extends Vue {

  intervenantId: string | null = null;
  intervenant: any = null;

  refFormatee:string | null = null;

  query:string | null = null;

  organization: string|null=null;

  latest: Context|null = null

  mounted(){

      //
      // subscribe zendesk context
      // - context version (to compare)
      // - intervenant: phone, email, iid, référence formatée
      // - ticket content
      $zendesk.observable().subscribe(async (context:Context)=>{
        $apiService.init(context);
        // reset state
        this.latest = context;
        this.refFormatee = null; 
        this.intervenant = null;
        this.intervenantId = null;
        this.query = null;
        this.organization = this.organization || context.organization || null;
        
        //
        // state decision process
        if(context.refFormat){
          // best outcome, we know the contract ref
          // we fetch it and display it
          this.refFormatee = context.refFormat;
        } else{
          this.query = context.email || context.phone ||null;
          this.intervenantId = context.intervenantId||null;
        }

        console.table([["refFormatee", this.refFormatee], ["intervenant", this.intervenant], ["intervenant id", this.intervenantId], ["query", this.query]]);
      });
  }

  async onIntervenantSelected(intervenant:any){
    this.intervenant = intervenant;
    this.query = null;
    this.intervenantId = null;
    await $zendesk.saveIntervenant(intervenant.DisplayID);
  }
  
  async onCoproSelected(copro:any){
    console.log("selected copro", copro);
    this.refFormatee = copro.IDZendesk;

    if(this.intervenant) {
      await $zendesk.saveIntervenant(this.intervenant.DisplayID);
    }

    this.intervenant = null;
    await $zendesk.saveContrat(this.refFormatee!);
  }

  async onClear() {
    this.intervenant = null;
    this.refFormatee = null;
    await $zendesk.saveIntervenant(null);
    await $zendesk.saveContrat(null);
    if(this.latest){
      $zendesk.update(this.latest);
    }
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
