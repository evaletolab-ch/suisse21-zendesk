<template>
  <div class="zendesk">
    <form>
      <div class="form-group">
        <label for="comment">Créer un ticket à partir du commentaire</label>
        <select id="comment"  class="form-control" v-model="form.descriptionIdx">
          <option v-for="(comment,index) in comments" :key="index" :value="index">
            {{ comment.plain_body }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="app">Renseigner l'application</label>
        <select id="app"  class="form-control" v-model="form.application">
          <option v-for="(app,index) in apps" :key="index" :value="index">
            {{ app }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="">Renseigner le sujet</label>
        <input type="text" placeholder="Sujet du nouveau ticket" class="form-control" v-model="form.subject" required aria-describedby="helpBlock"> 
        <small id="helpBlock" class="form-text text-muted">
          Minimum 20 caractères
        </small>
      </div>
      <div class="form-group">
        <button type="button" class="btn btn-primary" @click="onDuplicate" :disabled="!form.subject||context.error">Créer</button>
      </div>
    </form>
    
    <!-- <a href="#" @click="onOpenTicket">{{ newticket.id }}</a> -->
    <div class="alert alert-success" role="alert" :class="{ hide:!newticket.id }">
      Un nouveau ticket a été créé <a href="#" @click="onOpenTicket">{{ newticket.id }}</a>
    </div>
    <div class="alert alert-danger" role="alert" :class="{ hide:!context.error }">
      {{context.error}}
    </div>    
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { $zendesk, Context } from '../services/ZendeskContext';

@Component({
  components:{
  }
})
export default class Swiss21Zendesk extends Vue {

  newticket:any = {};
  context: Context|any = {};
  form:any ={
    id:0,
    subject:'',
    application:0,
    description:null,
    descriptionIdx:0
  }

  get apps () {
    const field = this.context.custom_field;
    if(!field) {
      return ['Erreur avec le champ'];
    }
    return field.custom_field_options.map((option:any) => option.name);
  }

  get comments() {
    //const stripHtml = /(<([^>]+)>)/ig;
    const _comments = this.context.comments && this.context.comments.comments||[];
    return _comments.map( (comment:any) => {
      comment.plain_body = (comment.plain_body||'').substring(0,40)+'...';
      return comment;
    })
  }


  async mounted() {
    try{
      this.context = await $zendesk.load();
      this.form.id = this.context.id;

      //
      // emit context
      $zendesk.update(this.context);
    }catch(err:any) {
      this.context.error = err.message;
      $zendesk.update(this.context);
    }
  }



  async onDuplicate() {
    try{
      const commentIdx = this.form.descriptionIdx;
      this.form.description = this.context.comments.comments[commentIdx].body;
      this.newticket = await $zendesk.createTicket(this.form, this.context);
      await  $zendesk.solveTicket(this.context);
      setTimeout(()=>this.$forceUpdate(),400);
      console.log('----DBG create and save ticket',this.newticket);
    }catch(err:any) {
      this.context.error = err.message|err.statusText|err;
      setTimeout(()=>this.$forceUpdate(),400);
      console.log('----DBG ERROR onDuplicate',err);
    }
  }


  onOpenTicket() {
    $zendesk.setActiveTicket(this.newticket.id);
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
