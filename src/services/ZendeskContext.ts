import { ReplaySubject } from 'rxjs'
import { ZendeskContextMock } from './ZendeskContext.mock';
//
// Zendesk is imported from index.html as javascript
declare const ZAFClient:any;

export interface Context {
  __v: number;
  token: string;
  refFormat?: string;
  intervenantId?: string;
  uid?: string;
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  error?: string;
  organization?: string;
  ticket?:any;
}

//
// - source : https://developer.zendesk.com/documentation/ticketing/reference-guides/via-object-reference/ 
export interface Ticket {
  subject: string;
  description: string;
  url:string;
  source: string;
  refFormat: string;
  intervenantId: string;
  content:string;
}
//
// load zendesk API on runtime load
const client = ZAFClient.init();

class ZendeskContext {
  ZENDESK_REFFORMAT='ticket.customField:custom_field_8458947622802';
  ZENDESK_ORG = 'ticket.organization';
  ZENDESK_ORG_ID = 'ticket.organization_id';
  private version = 1;
  private znedesk$ = new ReplaySubject<Context>(1);
  private ticket:Ticket|any = {};
  private currentRequester = "";
  private currentTicket = "";
  private currentTicketOrganization:any = {};

  $reference = new RegExp('([0-9]{6}.?[0-9]{5}.?[0-9]{2})','gm');

  // WARNING: the same regexp is used on backend
  $phone = new RegExp(/([0-9]{4}|\+[0-9]{2}|\(0\))?[ /-]?(0?[1-9]{2})\/?.?([0-9]{3}).?([0-9]{2}).?([0-9]{2})/);

  get isEnabled() {
    return !!client;
  }

  organizationTicketCheckName(name: string) {
    if(!this.currentTicketOrganization){
      return false;
    }
    return (this.currentTicketOrganization.name == name);
  }

  
  async load(): Promise<Context> {
    try{
      
      if(!client) {
        throw "Not a zendesk container";
      }      
      //
      // get active token from metadata.settings.token
      const metadata = await client.metadata();
      this.token = metadata.settings.token;
      this.ZENDESK_EXTERNAL_ID = metadata.settings.field_iid || this.ZENDESK_EXTERNAL_ID;
      this.ZENDESK_REFFORMAT = metadata.settings.field_refid || this.ZENDESK_REFFORMAT;
      if(!this.token) {
        throw "Missing M-Files token";
      }      
      console.log('--- DBG ZendeskContext token',this.token);

      //
      // get tocket context
      // custom_field_4835238918685 référence formatée
      const ticket = await client.get([
            'ticket.id',
            'ticket.description',
            'ticket.subject', 
            'ticket.requester.id',
            'ticket.requester.name',
            'ticket.requester.email',
            this.ZENDESK_EXTERNAL_ID,
            this.ZENDESK_REFFORMAT,
            this.ZENDESK_ORG
      ]);
      const phone = this.$phone.test(ticket['ticket.requester.name'])?ticket['ticket.requester.name']:'';
      const context:Context = {
        __v: this.version,
        uid: ticket['ticket.requester.id'],
        name: ticket['ticket.requester.name'],
        description: ticket['ticket.description'],
        email: ticket['ticket.requester.email'],
        phone: phone,
        intervenantId:ticket[this.ZENDESK_EXTERNAL_ID],
        refFormat:ticket[this.ZENDESK_REFFORMAT],
        token: this.token
      };
      console.log('--- DBG ZendeskContext client.get()',ticket);

      //
      // keep current requester
      this.currentRequester = context.uid || "";
      this.currentTicket = ticket['ticket.id'];

      //
      // default org is Null
      this.currentTicketOrganization = ticket[this.ZENDESK_ORG] || {};

      // DEBUG ---
      // const fields = await client.get('ticketFields');
      // console.log('--DBG fields',JSON.stringify(fields,null,2));

      //
      // looking for reference formatée
      if(ticket['ticket.description'] && !context.refFormat) {
        const id = this.$reference.exec(ticket['ticket.description']);
        context.refFormat = (id && id.length)? id[0]:'';
      }

      //
      // export ticket
      client.on('ticket.save', this.saveTicket.bind(this))

      //
      // emit context
      return context;

    }catch(err:any) {
      $apiService.sendError(err);
      const error = err.message||err;
      this.showError(err.status,error);
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
  async saveTicket(status: any) {
    if(!client) {
      throw "Not a zendesk container";
    }

    console.log('--- DBG save',status);

    const properties = [
      'ticket.description',
      'ticket.subject', 
      'ticket.via.channel',
      'ticket',
      this.ZENDESK_REFFORMAT,
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



    console.log('----DBG save ticket',ticket);
    this.update({ ticket } as Context);  

  }

  showError(status: number, message:string) {  
    const $window:any = window
    const error = {    
      status: (status||400),    
      statusText: message 
    };  
    const source = $window.$("#error-template").html();  
    const template = $window.Handlebars.compile(source);  
    const html = template(error);  
    $window.$("#content").html(html);
  }

}


export const $zendesk = client? new ZendeskContext():new ZendeskContextMock();
