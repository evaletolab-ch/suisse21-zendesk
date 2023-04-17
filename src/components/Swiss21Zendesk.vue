<template>
  <div class="zendesk">
    <form>
      <div class="form-group">
        <label for="comment">Créer un ticket à partir du commentaire</label>
        <select id="comment"  class="form-control">
          <option v-for="(comment,index) in comments" :key="index">
            {{ comment.plain_body }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="app">Renseigner l'application</label>
        <select id="app"  class="form-control">
          <option v-for="(app,index) in apps" :key="index">
            {{ app }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="">Renseigner le sujet</label>
        <input type="text" placeholder="Sujet du nouveau ticket" class="form-control" v-model="subject" required aria-describedby="helpBlock"> 
        <small id="helpBlock" class="form-text text-muted">
          Minimum 20 caractères
        </small>
      </div>
      <div class="form-group">
        <button type="button" class="btn btn-primary" @click="onDuplicate" :disabled="!subject">Créer</button>
      </div>
    </form>
    
    <div class="alert alert-success hide" role="alert">
      This is a success alert—check it out!
    </div>
    <div class="alert alert-danger" role="alert" :class="{hide:!context.error}">
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

  context: Context|any = {};
  subject = '';

  get apps () {
    return ['app1','app2','app3']
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

      //
      // emit context
      $zendesk.update(this.context);
    }catch(err:any) {
      this.context.error = err.message;
      $zendesk.update(this.context);
    }
  }



  async onDuplicate() {
    //await this.$nextTick();
    this.$forceUpdate();
    this.context.error = 'Opps: Not yet implemented';
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
