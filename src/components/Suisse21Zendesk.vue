<template>
  <div class="zendesk">
    <h3>Rechercher le contrat par:  <div class="arrow-button">⬇</div></h3>
    <ul>
      <li>
        <input type="email" placeholder="Email" :value="context.email" @keydown.enter="onEmail"> 
        <input type="text" placeholder="Téléphone" :value="context.phone" @keydown.enter="onPhone"></li>
      <li>
        <input type="text" placeholder="Réf. Intervenant Quorum" :value="context.intervenantId" @keydown.enter="onIntervenant"> 
        <input type="text" placeholder="Référence Formatée" :value="context.refFormat" @keydown.enter="onRefFormat">
      </li>
      <li class="hide">
        <button @click="onSearch" >Rechercher</button>
      </li>
      <li>
        lien M-Files vers la collection des copropriétaires <MFCoprosLink />
      </li>
    </ul>
    
    <p class="error" :class="{hide:!context.error}">
      {{context.error}}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { $zendesk, Context } from '../services/ZendeskContext';
import MFCoprosLink from './MFCoprosLink.vue';

@Component({
  components:{
    MFCoprosLink,
  }
})
export default class Suisse21Zendesk extends Vue {

  context: Context|any = {};

  async mounted() {
    try{
      this.context = await $zendesk.load();

      //
      // emit context
      $zendesk.update(this.context);
    }catch(err:any) {
      this.context.error = err.message;
      $zendesk.update(this.context);
    }
  }

  onPhone(event:any) {
    try{
      this.context.error = undefined;
      const context = {phone:event.target.value} as Context;
      $zendesk.update(context);
    }catch(err){
      this.context.error = err.message;
    }
  }


  async onEmail(event:any) {
    try{
      this.context.error = undefined;
      const context = {email:event.target.value} as Context;
      await $zendesk.update(context);
    }catch(err){
      this.context.error = err.message;
    }
  }

  async onIntervenant(event:any) {
    if(event.target.value=='') {
      return;
    }
    try{
      const context = {intervenantId:event.target.value} as Context;
      await $zendesk.update(context);
    }catch(err){
      this.context.error = err.message;
    }

  }

  async onRefFormat(event:any) {
    const ref = event.target.value;
    if(ref=='') {
      return;
    }
    try{
      const context = {refFormat:ref} as Context;
      await $zendesk.update(context);
    }catch(err){
      this.context.error = err.message;
    }
  }

  async onSearch() {
    throw ('Not implemented')
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

.zendesk {
  border-bottom: 1px solid #eee;
  text-align: left;
  padding-left: 0px;
  h3{
    margin-bottom: 0;
  }

  .error{
    padding: 20px;
    background: #eee;
    border: 1px solid red;
    width: calc( 100% - 50px );
  }

}

.arrow-button {
  float: right;
  margin: 0 10px;
  color: #bebdc5;  
  cursor: pointer;
}

.bold{
  font-weight: 600;
}

ul{
  text-align: left;
  list-style: none;
  padding: 10px 0;
  input {
    padding: 5px 3px;
    margin: 3px 0;
    border: 1px solid #eee;    
    width: 47%;
    @media (max-width:390px) {
      width: 155px;
    }
  }
}
</style>
