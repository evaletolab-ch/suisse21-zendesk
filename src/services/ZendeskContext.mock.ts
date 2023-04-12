import { ReplaySubject } from 'rxjs';


export class ZendeskContextMock {
  private znedesk$ = new ReplaySubject<any>(1);
  token = "prout";
  version = 0;


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

  async createTicket(status: any) {
    console.log('---- DBG mock save ticket')
  }

  showError(status: number, message:string) {  
    console.log('---- DBG save show',message);
  }

}
