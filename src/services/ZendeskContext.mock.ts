import { ReplaySubject } from 'rxjs';
import $apiService from './ApiService';


export class ZendeskContextMock {
  private znedesk$ = new ReplaySubject<any>(1);
  currentTicketOrganization:any = {};
  currentTicketOrganizationCoproName = "";
  token = "prout";
  version = 0;

  organizationTicketCheckName(name: string) {
    return (this.currentTicketOrganization.name == name);
  }

  organizationCoproName(name: string) {
    this.currentTicketOrganizationCoproName = name;
  }


  async organizationCreateByName(name: string) {
    this.currentTicketOrganization.name = name;
    const data = {
      organization: {
        name: name
      }
    };
    return data.organization;
  }

  async organizationCreateMembership(organizationId: string) {
    const data = {
      organization_membership: {
        user_id: 1,
        organization_id:organizationId
      }
    };
    return data.organization_membership;
}


  async organizationUpdateTicket(organizationId: string, name: string) {
    this.currentTicketOrganization.name = name;
    return {
      organization_id:organizationId
    }
  }  

  async organizationsAll() {
    return [];
  }

  async organizationsListByName(name: string) {
    return [];
  }

  async load(){
    console.log('---- DBG load mock');
    return {}
  }

  update(context: any) {
    context.__v = ++this.version;
    context.token = this.token;
    this.znedesk$.next(context);
  }

  observable() {
    return this.znedesk$.asObservable();
  }

  async saveIntervenant(id: string|null) {
    console.log('---- DBG mock save intervenant')
  }

  async saveContrat(ref: string|null) {
    console.log('---- DBG mock save contrat')
  }

  async saveTicket(status: any) {
    console.log('---- DBG mock save ticket')
  }

  showError(status: number, message:string) {  
    console.log('---- DBG save show',message);
    $apiService.sendError({message:message})
  }

}
