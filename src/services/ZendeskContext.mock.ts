import { ReplaySubject } from 'rxjs';


export class ZendeskContextMock {
  private znedesk$ = new ReplaySubject<any>(1);
  token = "prout";
  version = 0;

  comments = {
    "comments": [{
      "id": 14616576366993,
      "type": "Comment",
      "author_id": 13484908006801,
      "body": "Test sur plusieurs lignes.\nMerci et une bonne journée,\n\nCordialement,\nFoo",
      "html_body": "<div class=\"zd-comment\" dir=\"auto\">Test sur plusieurs lignes.<br>Merci et une bonne journée,<br><br>Cordialement,<br>Foo<br></div>",
      "plain_body": "Test sur plusieurs lignes.\nMerci et une bonne journée,\n\nCordialement,\nFoo",
      "public": true,
      "attachments": [],
      "audit_id": 14616576366353,
      "via": {
        "channel": "web",
        "source": {
          "from": {},
          "to": {
            "name": "Rdep",
            "address": "remo.deplazes@sunrise.ch"
          },
          "rel": null
        }
      },
      "created_at": "2023-04-17T15:29:15Z",
      "metadata": {
        "system": {
          "client": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36",
          "ip_address": "178.197.192.236",
          "location": "Renens, VD, Switzerland",
          "latitude": 46.5388,
          "longitude": 6.5886
        },
        "custom": {}
      }
    }, {
      "id": 699743069537,
      "type": "Comment",
      "author_id": 368995131397,
      "body": "",
      "html_body": "<div class=\"zd-comment\" dir=\"auto\"><br></div>",
      "plain_body": "",
      "public": true,
      "attachments": [],
      "audit_id": 699743069517,
      "via": {
        "channel": "web",
        "source": {
          "from": {},
          "to": {},
          "rel": null
        }
      },
      "created_at": "2020-10-08T17:42:21Z",
      "metadata": {
        "system": {
          "client": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
          "ip_address": "84.227.177.242",
          "location": "Moosseedorf, BE, Switzerland",
          "latitude": 47.0168,
          "longitude": 7.4839
        },
        "custom": {}
      }
    }, {
      "id": 649177968617,
      "type": "Comment",
      "author_id": 368995131397,
      "body": "test",
      "html_body": "<div class=\"zd-comment\" dir=\"auto\">test<br></div>",
      "plain_body": "test",
      "public": true,
      "attachments": [{
        "url": "https://pdi-adtconsulting.zendesk.com/api/v2/attachments/365962146158.json",
        "id": 365962146158,
        "file_name": "Andreas.png",
        "content_url": "https://pdi-adtconsulting.zendesk.com/attachments/token/cN6pJ0mWZxFpdCbwKeLw0HBgk/?name=Andreas.png",
        "mapped_content_url": "https://pdi-adtconsulting.zendesk.com/attachments/token/cN6pJ0mWZxFpdCbwKeLw0HBgk/?name=Andreas.png",
        "content_type": "image/png",
        "size": 326452,
        "width": 765,
        "height": 443,
        "inline": false,
        "deleted": false,
        "malware_access_override": false,
        "malware_scan_result": "not_scanned",
        "thumbnails": [{
          "url": "https://pdi-adtconsulting.zendesk.com/api/v2/attachments/365962146358.json",
          "id": 365962146358,
          "file_name": "Andreas_thumb.png",
          "content_url": "https://pdi-adtconsulting.zendesk.com/attachments/token/ueQEazMebTYTRr7M6tZaGw8lY/?name=Andreas_thumb.png",
          "mapped_content_url": "https://pdi-adtconsulting.zendesk.com/attachments/token/ueQEazMebTYTRr7M6tZaGw8lY/?name=Andreas_thumb.png",
          "content_type": "image/png",
          "size": 6534,
          "width": 80,
          "height": 46,
          "inline": false,
          "deleted": false,
          "malware_access_override": false,
          "malware_scan_result": "not_scanned"
        }]
      }],
      "audit_id": 649177968497,
      "via": {
        "channel": "web",
        "source": {
          "from": {},
          "to": {},
          "rel": null
        }
      },
      "created_at": "2020-06-29T10:24:11Z",
      "metadata": {
        "system": {
          "client": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0",
          "ip_address": "84.227.177.249",
          "location": "Moosseedorf, BE, Switzerland",
          "latitude": 47.0168,
          "longitude": 7.4839
        },
        "custom": {}
      }
    }],
    "next_page": null,
    "previous_page": null,
    "count": 17
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

  async solveTicket(context:any){
    console.log('---- DBG mock solve ticket')
  }

  async createTicket(status: any) {
    console.log('---- DBG mock save ticket')
  }

  async setActiveTicket(id:any) {
  }


}
