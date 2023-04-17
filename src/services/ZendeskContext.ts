import { ReplaySubject } from 'rxjs'
import { ZendeskContextMock } from './ZendeskContext.mock';
//
// Zendesk is imported from index.html as javascript
declare const ZAFClient:any;

export interface Context {
  __v: number;
  id: number;
  uid?: string;
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  error?: string;
  organization?: string;
  comments?:any[];
  ticket?:any;
  applications:string[];
}

//
// - source : https://developer.zendesk.com/documentation/ticketing/reference-guides/via-object-reference/ 
export interface Ticket {
  subject: string;
  description: string;
  url:string;
  source: string;
  content:string;
}
//
// load zendesk API on runtime load
const client = ZAFClient.init();

class ZendeskContext {
  ZENDESK_CUSTOM_APP_SELECT='ticket.customField:custom_field_360004818657';
  ZENDESK_CUSTOM_TEMPLATE='{{dc.clone_app_text}}';
  ZENDESK_ORG = 'ticket.organization';
  ZENDESK_ORG_ID = 'ticket.organization_id';
  private version = 1;
  private znedesk$ = new ReplaySubject<Context>(1);
  private ticket:Ticket|any = {};

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
      const ticket = await client.get([
            'ticket.id',
            'ticket.description',
            'ticket.subject', 
            'ticket.requester.id',
            'ticket.requester.name',
            'ticket.requester.email',
            this.ZENDESK_CUSTOM_APP_SELECT,
            this.ZENDESK_ORG
      ]);

      const context:Context = {
        __v: this.version,
        id:ticket['ticket.id'],
        uid: ticket['ticket.requester.id'],
        name: ticket['ticket.requester.name'],
        description: ticket['ticket.description'],
        email: ticket['ticket.requester.email'],
        organization: ticket[this.ZENDESK_ORG],
        applications:ticket[this.ZENDESK_CUSTOM_APP_SELECT],
        ticket
      };


      //
      // get associated tickets comments
      // https://developer.zendesk.com/api-reference/ticketing/tickets/ticket_comments/#list-comments
      // https://developer.zendesk.com/api-reference/apps/apps-support-api/ticket_sidebar/#comment-object
      context.comments = await client.request(`/api/v2/tickets/${context.id}/comments?sort_order=desc`);

      console.log('--- DBG ZendeskContext comment',context.comments);


      //
      // emit context
      return context;

    }catch(err:any) {
      const error = err.message||err;
      this.showError(err.status,error);
      console.log('----- ERROR',err);
      return {__v:1,error} as Context;      
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
  // https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#json-format
  async createTicket(status: any) {
    if(!client) {
      throw "Not a zendesk container";
    }

    console.log('--- DBG save',status);

    const properties = [
      'ticket.description',
      'ticket.subject', 
      'ticket.via.channel',
      'ticket',
      this.ZENDESK_CUSTOM_APP_SELECT,
      this.ZENDESK_ORG
  ];


    //
    // ticket content
    const ticket:any = await client.get(properties)
    this.ticket.url = window.location.href;
    this.ticket.source = ticket['ticket.via.channel'];
    this.ticket.subject = ticket['ticket.subject'];
    this.ticket.description = ticket['ticket.description'];
    this.ticket.content = JSON.stringify(ticket.ticket);

    const organization = ticket[this.ZENDESK_ORG] || {};



    console.log('----DBG create and save ticket',ticket);
    this.update({ ticket } as Context);  

  }

  showError(status: number, message:string) {  
    const $window:any = window
    const error = {    
      status: (status||400),    
      statusText: message 
    };  
    // const source = $window.$("#error-template").html();  
    // const template = $window.Handlebars.compile(source);  
    // const html = template(error);  
    // $window.$("#content").html(html);
  }

}


export const $zendesk = client? new ZendeskContext():new ZendeskContextMock();
