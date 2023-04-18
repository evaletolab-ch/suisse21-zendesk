import { ReplaySubject } from 'rxjs'
import { ZendeskContextMock } from './ZendeskContext.mock';


//
// Zendesk is imported from index.html as javascript
declare const ZAFClient:any;

export interface Context {
  __v: number;
  id: number;
  ticket?:any;
  comments?:any;
  requester?:any;
  custom_field?:any[];
  error?:string;
}

//
// load zendesk API on runtime load
const client = ZAFClient.init();

class ZendeskContext {
  //
  // this version is only for client.set() call
  //ZENDESK_CUSTOM_APP_SELECT='ticket.customField:custom_field_360004818657';
  ZENDESK_CUSTOM_APP_SELECT='360004818657';
  ZENDESK_CUSTOM_TEMPLATE='{{dc.clone_app_text}}';
  ZENDESK_ORG_ID = 'ticket.organization_id';
  private version = 1;
  private znedesk$ = new ReplaySubject<Context>(1);

  // WARNING: the same regexp is used on backend
  $phone = new RegExp(/([0-9]{4}|\+[0-9]{2}|\(0\))?[ /-]?(0?[1-9]{2})\/?.?([0-9]{3}).?([0-9]{2}).?([0-9]{2})/);

  get isEnabled() {
    return !!client;
  }


  
  async load(): Promise<Context> {
    try{
      
      if(!client) {
        throw "Not a zendesk container";
      }      
      //
      // get active token from metadata.settings.token
      const metadata = await client.metadata();

      //
      // Custom field for Swiss21 Applications support
      // Custom field for message template
      this.ZENDESK_CUSTOM_APP_SELECT = metadata.settings.field_custom_id || this.ZENDESK_CUSTOM_APP_SELECT;

      //
      // get tocket context
      // custom_field_4835238918685 
      // https://stackoverflow.com/questions/75391573/zendesk-listen-agent-response-event-zaf-client-support-location
      // 'type', 'subject', 'priority', 'assignee_id', 'group_id', 'custom_fields', 'fields', 'ticket_form_id', 'brand_id'
      const elems = [
        'ticket.id',
        'ticket.requester.id',
        'ticket.requester.name',
        'ticket.requester.email'
      ]
      const id = await client.get(elems);
      const content = await client.request('/api/v2/tickets/'+id['ticket.id']);

      const fields = await client.request('/api/v2/ticket_fields/'+ this.ZENDESK_CUSTOM_APP_SELECT);

      const context:Context = {
        __v: this.version,
        id:id['ticket.id'],
        ticket:content.ticket,
        custom_field: fields.ticket_field
      };

      //
      // force group id
      context.ticket.group_id = context.ticket.group_id;

      //
      // create requester
      if(id['ticket.requester.id'] || id['ticket.requester.name'] || id['ticket.requester.email']) {
        context.requester = {
          id:id['ticket.requester.id'],
          name:id['ticket.requester.name'],
          email:id['ticket.requester.email']
        }
      }


      //
      // get associated tickets comments
      // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_comments/#list-comments
      // https://developer.zendesk.com/api-reference/apps/apps-support-api/ticket_sidebar/#comment-object
      context.comments = await client.request(`/api/v2/tickets/${context.id}/comments?sort_order=desc`);
      context.comments = context.comments || {comments:[]};

      console.log('--- DBG ZendeskContext ticket ',id);
      console.log('--- DBG ZendeskContext context',context);

      //
      // verify context of ticket
      if(content.ticket.status == 'solved'){
        context.error = 'Impossible de modifier un ticket fermé';
      }


      //
      // emit context
      return context;

    }catch(err:any) {
      const error = err.message||err;
      console.log('----- ERROR',err);
      return {error} as Context;      
    }
  }

  update(context: Context) {
    context.__v = ++this.version;
    this.znedesk$.next(context);
    console.log('----DBG ZendeskContext context',context);
  }

  observable() {
    return this.znedesk$.asObservable();
  }

  //
  // comment ticket and solve it
  async solveTicket(context:any){
    try{
      const body = {
        ticket: {
          comment: {
            body: this.ZENDESK_CUSTOM_TEMPLATE,
            public: true
          },
          status: "solved"
        }
      }
  
      const options = {
        method:'PUT',
        url:`/api/v2/tickets/${context.id}`,
        dataType: "json",
        data:body
      }
      await client.request(options);  
    }catch(err:any){
      console.log('----DBG solveTicket',err);
      throw err;
    }
  }

  //
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#json-format
  async createTicket(form: any, context:any) {
    if(!client) {
      throw "Not a zendesk container";
    }


    try{
      //
      // create new ticket with essential fields
      // 'type', 'subject', 'priority', 'assignee_id', 'group_id', 'custom_fields', 'fields', 'ticket_form_id', 'brand_id'
      // via_followup_source_id
      const ticket:any = {
        ticket: {
          type:context.ticket.type,
          assignee_id:context.ticket.assignee_id,
          group_id:context.ticket.group_id,
          fields:[],
          tags:context.ticket.tags,
          ticket_form_id:context.ticket.ticket_form_id,
          brand_id:context.ticket.brand_id,
          organisation_id:context.ticket.organisation_id,
          priority: context.ticket.priority,
          subject: form.subject,
          custom_fields:[],
          description:form.description
        }
      }


      //
      // set the name, id or email of the requester
      if(context.requester) {
        ticket.ticket.requester = context.requester;
      }

      //
      // validate form 
      if(form.application>=0) {
        const values = context.custom_field.custom_field_options.map((option:any) => option.value);
        const field = context.custom_field.custom_field_options[form.application];
        values.forEach((value:string) => {
          const idx = ticket.ticket.tags.indexOf(value);
          if(idx ==-1) {
            return;
          }
          ticket.ticket.tags.splice(idx, 1);
        })
        ticket.ticket.tags.push(field.value);
        // 
        // const matched1 = ticket.ticket.custom_fields.findIndex((field:any) => field.id==this.ZENDESK_CUSTOM_APP_SELECT);
        // if(matched1>-1) {
        //   ticket.ticket.custom_fields[matched1].value = field.value;
        // } else {
        //   ticket.ticket.custom_fields.push({id:this.ZENDESK_CUSTOM_APP_SELECT,value:field.value});
        // }

        // const matched2 = ticket.ticket.fields.findIndex((field:any) => field.id==this.ZENDESK_CUSTOM_APP_SELECT);
        // if(matched2>-1) {
        //   ticket.ticket.fields[matched2].value = field.value;
        // } else {
        //   ticket.ticket.fields.push({id:this.ZENDESK_CUSTOM_APP_SELECT,value:field.value});
        // }
      }

      console.log(' -- clone ticket.type: ',ticket.ticket.type);
      console.log(' -- clone ticket.assignee_id: ',ticket.ticket.assignee_id);
      console.log(' -- clone ticket.group_id: ',ticket.ticket.group_id);
      console.log(' -- clone ticket.tags: ',ticket.ticket.tags);
      console.log(' -- clone ticket.ticket_form_id: ',ticket.ticket.ticket_form_id);
      console.log(' -- clone ticket.brand_id: ',ticket.ticket.brand_id);
      console.log(' -- clone ticket.organisation_id: ',ticket.ticket.organisation_id);
      console.log(' -- clone ticket.priority: ',ticket.ticket.priority);
      console.log(' -- clone ticket.fields: ',ticket.ticket.fields);
      console.log(' -- clone ticket.custom_fields: ',ticket.ticket.custom_fields);


      //
      // attach content
      // https://developer.zendesk.com/documentation/ticketing/using-the-zendesk-api/adding-ticket-attachments-with-the-api

      console.log('--- DBG createTicket',ticket);
      //
      // ticket content
      const options = {
        method:'POST',
        url:'/api/v2/tickets',
        dataType: "json",
        data:ticket
      }
      const data = await client.request(options);  
      return data.ticket;

    }catch(err:any){
      console.log('----DBG ERROR createTicket',err);
      throw (this.parseError(err));
    }


  }

  //
  // trigger
  // action references
  // https://developer.zendesk.com/documentation/ticketing/reference-guides/actions-reference/
  // https://developer.zendesk.com/api-reference/apps/apps-support-api/all_locations/#routeto
  async setActiveTicket(id:any) {
    await client.invoke('routeTo', 'ticket', id);
  }

  parseError(err:any) {
    if(err.responseJSON && err.responseJSON.description){
      err.message = err.responseJSON.description;

      Object.keys(err.responseJSON.details).forEach(key=>{        
        if(!err.responseJSON.details[key] &&!err.responseJSON.details[key][0]){
          return;
        }
        err.message = err.responseJSON.details[key][0].description || err.message;
      })
    }
    return err;
  }
}


export const $zendesk = client? new ZendeskContext():new ZendeskContextMock();
