import { Injectable } from '@angular/core'
import { AccountService } from '../core/auth/account.service'
import * as signalR from '@microsoft/signalr'
import { StateStorageService } from '../core/auth/state-storage.service'
import { BehaviorSubject } from 'rxjs'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { WebsocketPayload } from '../shared/models/websocket-payload.model'

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  isAuthenticatedCheck = false
  private projectHubConnection: signalR.HubConnection | undefined
  private connectionEstablished = new BehaviorSubject<boolean>(false)
  private dataPayloadSubject$ = new BehaviorSubject<WebsocketPayload | null>(null)

  constructor(private accountService: AccountService, private stateStorage: StateStorageService, private applicationConfigService: ApplicationConfigService) {
    this.accountService.isAuthenticated$.subscribe((val) => {
      if (this.isAuthenticatedCheck !== val && val === false) {
        this.isAuthenticatedCheck = val
      }
      if (this.isAuthenticatedCheck !== val && this.isAuthenticatedCheck === false) {
        this.projectHubConnection = new signalR.HubConnectionBuilder()
          .withUrl(applicationConfigService.getEndpointFor('/project'), {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
            accessTokenFactory: () => stateStorage.getAccessToken(),
          })
          .withAutomaticReconnect()
          .build()

        this.projectHubConnection
          .start()
          .then(() => {
            this.connectionEstablished.next(true)
          })
          .catch((err) => {
            this.connectionEstablished.next(false)
          })

        this.projectHubConnection.on('Project', (data: WebsocketPayload) => {
          this.dataPayloadSubject$.next(data)
        })

        this.projectHubConnection.onclose(() => {
          this.connectionEstablished.next(false)
        })

        this.isAuthenticatedCheck = val
      }
    })
  }

  get websocketData() {
    return this.dataPayloadSubject$.asObservable()
  }

  disconnect() {
    this.projectHubConnection?.stop()
  }
}
